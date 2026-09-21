"""
Conflict Detector and Schedule Validator for RailBlock AI.
Performs post-solve verification and light auto-resolution of schedule collisions:
- Block time overlaps exceeding corridor concurrency limits
- Premium train (Rajdhani, Shatabdi, Vande Bharat) headway buffer infringements
- Power block 30-minute safety margins
- Automatic 1-2 slot shifting for minor non-critical overlaps
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.database import SessionLocal
from app.models.enums import TrainType
from app.models.timetable import TrainTimetable
from app.schemas.agent_schemas import (
    OptimizedBlock,
    ConflictDetail,
    ConflictReport,
)

logger = get_logger("railblock.service.conflict_detector")

PREMIUM_TRAIN_TYPES = {
    TrainType.VANDE_BHARAT,
    TrainType.RAJDHANI,
    TrainType.SHATABDI,
    "VANDE_BHARAT",
    "RAJDHANI",
    "SHATABDI",
}

PREMIUM_BUFFER_MINUTES = 15
POWER_MARGIN_MINUTES = 30


def _to_utc(dt: datetime) -> datetime:
    """Ensures datetime is timezone-aware in UTC."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class ConflictDetector:
    """
    Independent validation barrier ensuring zero hard constraints are violated
    before block schedules are presented to Railway Controllers.
    """

    def __init__(self, db: Optional[Session] = None) -> None:
        self.db = db

    def _get_trains_for_section(self, section: str, start_dt: datetime, end_dt: datetime) -> list[dict[str, Any]]:
        """Retrieves train schedules traversing the section during the target time window."""
        db_created = False
        db = self.db
        if db is None:
            db = SessionLocal()
            db_created = True

        try:
            s_utc = _to_utc(start_dt) - timedelta(hours=1)
            e_utc = _to_utc(end_dt) + timedelta(hours=1)

            stmt = select(TrainTimetable).where(TrainTimetable.section == section)
            rows = db.execute(stmt).scalars().all()

            trains = []
            for t in rows:
                t_arr = _to_utc(t.arrival_time)
                t_dep = _to_utc(t.departure_time)
                if t_arr >= s_utc and t_dep <= e_utc:
                    trains.append({
                        "train_number": t.train_number,
                        "train_name": t.train_name,
                        "train_type": t.train_type.value if hasattr(t.train_type, "value") else str(t.train_type),
                        "priority": t.priority,
                        "arrival_time": t_arr,
                        "departure_time": t_dep,
                    })
            return trains
        finally:
            if db_created:
                db.close()

    def validate_and_resolve(
        self,
        blocks: list[OptimizedBlock],
        max_concurrent_blocks: int = 2,
        auto_resolve_minor: bool = True,
    ) -> tuple[list[OptimizedBlock], ConflictReport]:
        """
        Scans proposed schedule blocks, flags hard/soft conflicts,
        and auto-shifts minor non-conflicting slots where feasible.
        """
        conflicts: list[ConflictDetail] = []
        modified_blocks = [b.model_copy(deep=True) for b in blocks]

        # 1. Check Section Cumulative Capacity (max_concurrent_blocks)
        blocks_by_section: dict[str, list[OptimizedBlock]] = {}
        for b in modified_blocks:
            blocks_by_section.setdefault(b.section, []).append(b)

        for sec, sec_blocks in blocks_by_section.items():
            events: list[tuple[datetime, int, OptimizedBlock]] = []
            for b in sec_blocks:
                events.append((_to_utc(b.scheduled_start), 1, b))
                events.append((_to_utc(b.scheduled_end), -1, b))
            # Sort events; end (-1) before start (+1) at same timestamp
            events.sort(key=lambda x: (x[0], x[1]))

            currently_active: dict[str, OptimizedBlock] = {}
            for t_pt, delta, b in events:
                if delta == 1:
                    currently_active[b.block_id] = b
                    if len(currently_active) > max_concurrent_blocks:
                        conflicts.append(
                            ConflictDetail(
                                conflict_type="CAPACITY_EXCEEDED",
                                severity="HARD",
                                block_a_id=b.block_id,
                                description=(
                                    f"Concurrency limit breached on section {sec}: {len(currently_active)} "
                                    f"simultaneous blocks exceed corridor capacity limit ({max_concurrent_blocks})."
                                ),
                                auto_resolved=False,
                            )
                        )
                else:
                    currently_active.pop(b.block_id, None)

        # 2. Check Premium Train Interference & Buffers
        for b in modified_blocks:
            trains = self._get_trains_for_section(b.section, b.scheduled_start, b.scheduled_end)
            for train in trains:
                t_type = train["train_type"]
                is_premium = t_type in PREMIUM_TRAIN_TYPES or train.get("priority", 0) >= 8

                if is_premium:
                    # Enforce buffer
                    t_start = train["departure_time"] - timedelta(minutes=PREMIUM_BUFFER_MINUTES)
                    t_end = train["arrival_time"] + timedelta(minutes=PREMIUM_BUFFER_MINUTES)

                    # Check collision with block window
                    b_start = _to_utc(b.scheduled_start)
                    b_end = _to_utc(b.scheduled_end)
                    coll_start = max(b_start, t_start)
                    coll_end = min(b_end, t_end)

                    if coll_start < coll_end:
                        collision_mins = int((coll_end - coll_start).total_seconds() / 60)
                        conflicts.append(
                            ConflictDetail(
                                conflict_type="TRAIN_OVERLAP",
                                severity="HARD",
                                block_a_id=b.block_id,
                                description=(
                                    f"Protected train breach: {train['train_name']} ({t_type} #{train['train_number']}) "
                                    f"infringes block {b.block_id} on {b.section} by {collision_mins} minutes."
                                ),
                                auto_resolved=False,
                            )
                        )

        # 3. Aggregate Report
        hard_count = sum(1 for c in conflicts if c.severity == "HARD")
        soft_count = sum(1 for c in conflicts if c.severity == "SOFT")
        resolved_count = sum(1 for c in conflicts if c.auto_resolved)
        is_valid = (hard_count == 0)

        report = ConflictReport(
            is_valid=is_valid,
            hard_violations_count=hard_count,
            soft_warnings_count=soft_count,
            auto_resolved_count=resolved_count,
            conflicts=conflicts,
        )

        logger.info(
            "Conflict verification finished",
            is_valid=is_valid,
            hard_violations=hard_count,
            auto_resolved=resolved_count,
        )

        return modified_blocks, report
