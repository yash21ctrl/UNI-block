"""
Ingestion Agent for RailBlock AI.
Simulates real Indian Railways operational feeds (TMS, SMMS, TDMS, COA),
normalizes disparate schemas into canonical Pydantic representations,
enforces an automated Data Quality Firewall, and provides async parallel extraction.
"""

import asyncio
from datetime import datetime, timezone
import json
from pathlib import Path
import time
from typing import Any, Optional

from app.core.logging import get_logger
from app.models.enums import (
    Department,
    SourceSystem,
    DefectStatus,
    TrainType,
)
from app.schemas.agent_schemas import SourceResult, IngestionReport

logger = get_logger("railblock.agent.ingestion")

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"


class BaseAdapter:
    """Base interface for departmental data ingestion adapters."""

    def __init__(self, data_path: Path, source_name: str) -> None:
        self.data_path = data_path
        self.source_name = source_name

    def load_raw_data(self) -> list[dict[str, Any]]:
        """Reads JSON payload from disk."""
        if not self.data_path.exists():
            logger.warning("Data file not found", path=str(self.data_path))
            return []
        with open(self.data_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def normalize(self) -> SourceResult:
        """Parses and validates records, executing the quality firewall."""
        raise NotImplementedError


class TMSAdapter(BaseAdapter):
    """
    Adapter for Track Management System (TMS) - Civil Engineering.
    Captures rail fractures, USFD ultrasonic flaw detection, gauge widening, and sleeper degradation.
    """

    def __init__(self, data_path: Optional[Path] = None) -> None:
        super().__init__(data_path or (DATA_DIR / "tms_export.json"), SourceSystem.TMS.value)

    def normalize(self) -> SourceResult:
        start_time = time.perf_counter()
        raw_items = self.load_raw_data()
        accepted_ids: list[str] = []
        warnings: list[str] = []
        seen_keys: set[str] = set()
        rejected_count = 0

        for item in raw_items:
            defect_id = item.get("tms_defect_id")
            section = item.get("track_section")
            asset_code = item.get("asset_code")
            hazard_lvl = item.get("hazard_level")
            duration = item.get("possession_required_minutes", 0)

            # Data Quality Firewall
            if not defect_id or not section or not asset_code or section == "INVALID_CORRIDOR":
                rejected_count += 1
                warnings.append(f"Rejected TMS record {defect_id or 'UNKNOWN'}: Missing valid section or asset.")
                continue

            if not isinstance(hazard_lvl, int) or not (1 <= hazard_lvl <= 5):
                rejected_count += 1
                warnings.append(f"Rejected TMS record {defect_id}: Hazard level {hazard_lvl} out of bounds [1-5].")
                continue

            if duration <= 0:
                rejected_count += 1
                warnings.append(f"Rejected TMS record {defect_id}: Non-positive duration {duration}.")
                continue

            # Deduplication
            dedup_key = f"{section}:{asset_code}:{item.get('defect_category')}"
            if dedup_key in seen_keys:
                warnings.append(f"Duplicate TMS anomaly detected and suppressed: {defect_id}")
                rejected_count += 1
                continue
            seen_keys.add(dedup_key)

            accepted_ids.append(defect_id)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        total = len(raw_items)
        accepted = len(accepted_ids)
        quality_score = round(accepted / max(1, total), 3)

        logger.info(
            "TMS feed normalized",
            total=total,
            accepted=accepted,
            rejected=rejected_count,
            quality_score=quality_score,
            duration_ms=duration_ms,
        )

        return SourceResult(
            source=self.source_name,
            total_records=total,
            accepted=accepted,
            rejected=rejected_count,
            warnings=warnings,
            duration_ms=duration_ms,
            sample_accepted_ids=accepted_ids[:5],
            data_quality_score=quality_score,
        )


class SMMSAdapter(BaseAdapter):
    """
    Adapter for Signaling Maintenance Management System (SMMS).
    Captures point machine microswitch alerts, digital axle counter glitches, and signal lamps.
    """

    def __init__(self, data_path: Optional[Path] = None) -> None:
        super().__init__(data_path or (DATA_DIR / "smms_export.json"), SourceSystem.SMMS.value)

    def normalize(self) -> SourceResult:
        start_time = time.perf_counter()
        raw_items = self.load_raw_data()
        accepted_ids: list[str] = []
        warnings: list[str] = []
        seen_keys: set[str] = set()
        rejected_count = 0

        for item in raw_items:
            ticket_no = item.get("smms_ticket_no")
            section = item.get("section_code")
            equipment = item.get("equipment_tag")
            severity = item.get("severity_index")
            window_mins = item.get("rectification_window_minutes", 0)

            # Data Quality Firewall
            if not ticket_no or not section or not equipment or severity is None:
                rejected_count += 1
                warnings.append(f"Rejected SMMS record {ticket_no or 'UNKNOWN'}: Incomplete payload.")
                continue

            if not isinstance(severity, int) or not (1 <= severity <= 5):
                rejected_count += 1
                warnings.append(f"Rejected SMMS record {ticket_no}: Invalid severity {severity}.")
                continue

            if window_mins <= 0:
                rejected_count += 1
                warnings.append(f"Rejected SMMS record {ticket_no}: Non-positive window {window_mins}.")
                continue

            dedup_key = f"{section}:{equipment}:{item.get('failure_category')}"
            if dedup_key in seen_keys:
                rejected_count += 1
                warnings.append(f"Duplicate SMMS defect suppressed: {ticket_no}")
                continue
            seen_keys.add(dedup_key)

            accepted_ids.append(ticket_no)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        total = len(raw_items)
        accepted = len(accepted_ids)
        quality_score = round(accepted / max(1, total), 3)

        logger.info(
            "SMMS feed normalized",
            total=total,
            accepted=accepted,
            rejected=rejected_count,
            quality_score=quality_score,
            duration_ms=duration_ms,
        )

        return SourceResult(
            source=self.source_name,
            total_records=total,
            accepted=accepted,
            rejected=rejected_count,
            warnings=warnings,
            duration_ms=duration_ms,
            sample_accepted_ids=accepted_ids[:5],
            data_quality_score=quality_score,
        )


class TDMSAdapter(BaseAdapter):
    """
    Adapter for Traction Distribution Management System (TDMS / SCADA).
    Captures OHE tension degradation, insulator flashover, and neutral section conditions.
    """

    def __init__(self, data_path: Optional[Path] = None) -> None:
        super().__init__(data_path or (DATA_DIR / "tdms_export.json"), SourceSystem.TDMS.value)

    def normalize(self) -> SourceResult:
        start_time = time.perf_counter()
        raw_items = self.load_raw_data()
        accepted_ids: list[str] = []
        warnings: list[str] = []
        seen_keys: set[str] = set()
        rejected_count = 0

        for item in raw_items:
            event_id = item.get("tdms_event_id")
            corridor = item.get("corridor_code")
            asset_id = item.get("traction_asset_id")
            urgency = item.get("urgency_score")
            duration = item.get("estimated_block_duration_mins", 0)

            if not event_id or not corridor or not asset_id or urgency is None:
                rejected_count += 1
                warnings.append(f"Rejected TDMS record {event_id or 'UNKNOWN'}: Missing critical telemetry.")
                continue

            if not isinstance(urgency, int) or not (1 <= urgency <= 5):
                rejected_count += 1
                warnings.append(f"Rejected TDMS record {event_id}: Urgency score {urgency} invalid.")
                continue

            if duration <= 0:
                rejected_count += 1
                warnings.append(f"Rejected TDMS record {event_id}: Invalid block duration {duration}.")
                continue

            dedup_key = f"{corridor}:{asset_id}:{item.get('defect_nature')}"
            if dedup_key in seen_keys:
                rejected_count += 1
                warnings.append(f"Duplicate TDMS event suppressed: {event_id}")
                continue
            seen_keys.add(dedup_key)

            accepted_ids.append(event_id)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        total = len(raw_items)
        accepted = len(accepted_ids)
        quality_score = round(accepted / max(1, total), 3)

        logger.info(
            "TDMS feed normalized",
            total=total,
            accepted=accepted,
            rejected=rejected_count,
            quality_score=quality_score,
            duration_ms=duration_ms,
        )

        return SourceResult(
            source=self.source_name,
            total_records=total,
            accepted=accepted,
            rejected=rejected_count,
            warnings=warnings,
            duration_ms=duration_ms,
            sample_accepted_ids=accepted_ids[:5],
            data_quality_score=quality_score,
        )


class COAAdapter(BaseAdapter):
    """
    Adapter for Control Office Application (COA).
    Integrates dynamic train timetables, goods rake demands, and permissible block windows.
    """

    def __init__(
        self,
        timetable_path: Optional[Path] = None,
        windows_path: Optional[Path] = None,
    ) -> None:
        super().__init__(timetable_path or (DATA_DIR / "coa_timetable.json"), SourceSystem.COA.value)
        self.windows_path = windows_path or (DATA_DIR / "coa_block_windows.json")

    def normalize(self) -> SourceResult:
        start_time = time.perf_counter()
        raw_trains = self.load_raw_data()
        accepted_ids: list[str] = []
        warnings: list[str] = []
        seen_trains: set[str] = set()
        rejected_count = 0

        valid_train_types = {e.value for e in TrainType}

        for item in raw_trains:
            train_id = item.get("coa_train_id")
            section = item.get("operating_section")
            category = item.get("service_category")
            priority = item.get("priority_index")
            entry_time = item.get("planned_entry_utc")
            exit_time = item.get("planned_exit_utc")

            if not train_id or not section or not category or not entry_time:
                rejected_count += 1
                warnings.append(f"Rejected COA train {train_id or 'UNKNOWN'}: Incomplete schedule data.")
                continue

            if category not in valid_train_types:
                rejected_count += 1
                warnings.append(f"Rejected COA train {train_id}: Unknown service class '{category}'.")
                continue

            if not isinstance(priority, int) or not (1 <= priority <= 10):
                rejected_count += 1
                warnings.append(f"Rejected COA train {train_id}: Priority {priority} out of bounds [1-10].")
                continue

            if train_id in seen_trains:
                rejected_count += 1
                warnings.append(f"Duplicate COA train path suppressed: {train_id}")
                continue
            seen_trains.add(train_id)

            accepted_ids.append(train_id)

        # Validate block windows secondary file
        if self.windows_path.exists():
            with open(self.windows_path, "r", encoding="utf-8") as f:
                windows_data = json.load(f)
            for w in windows_data:
                sec = w.get("corridor_section")
                if sec:
                    accepted_ids.append(f"WINDOW-{sec}")

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        total = len(raw_trains)
        accepted = len(accepted_ids)
        quality_score = round(min(1.0, accepted / max(1, total)), 3)

        logger.info(
            "COA feed normalized",
            total=total,
            accepted=accepted,
            rejected=rejected_count,
            quality_score=quality_score,
            duration_ms=duration_ms,
        )

        return SourceResult(
            source=self.source_name,
            total_records=total,
            accepted=accepted,
            rejected=rejected_count,
            warnings=warnings,
            duration_ms=duration_ms,
            sample_accepted_ids=accepted_ids[:5],
            data_quality_score=quality_score,
        )


class IngestionAgent:
    """
    Ingestion Agent coordinating parallel departmental feed extraction,
    schema canonicalization, and data quality validation.
    """

    def __init__(self) -> None:
        self.adapters: dict[str, BaseAdapter] = {
            SourceSystem.TMS.value: TMSAdapter(),
            SourceSystem.SMMS.value: SMMSAdapter(),
            SourceSystem.TDMS.value: TDMSAdapter(),
            SourceSystem.COA.value: COAAdapter(),
        }

    async def ingest_source(self, source: str) -> SourceResult:
        """
        Runs ingestion for a single departmental source asynchronously.
        """
        source_upper = source.upper()
        adapter = self.adapters.get(source_upper)
        if not adapter:
            logger.error("Unknown ingestion source requested", source=source)
            return SourceResult(
                source=source,
                total_records=0,
                accepted=0,
                rejected=0,
                warnings=[f"Unsupported source system '{source}'"],
                duration_ms=0.0,
                sample_accepted_ids=[],
                data_quality_score=0.0,
            )

        logger.info("Executing source ingestion", source=source_upper)
        # Execute CPU/IO adapter synchronously inside thread pool to prevent blocking event loop
        result = await asyncio.to_thread(adapter.normalize)
        return result

    async def run(self, sources: Optional[list[str]] = None) -> IngestionReport:
        """
        Executes parallel multi-feed ingestion using asyncio.gather across all 4 systems.
        """
        start_time = time.perf_counter()
        target_sources = [s.upper() for s in (sources or list(self.adapters.keys()))]

        logger.info("IngestionAgent initiating parallel multi-department ingestion", sources=target_sources)

        # Run all selected source adapters concurrently in parallel
        tasks = [self.ingest_source(source) for source in target_sources]
        results: list[SourceResult] = await asyncio.gather(*tasks)

        details: dict[str, SourceResult] = {}
        total_records = 0
        total_accepted = 0
        total_rejected = 0
        quality_scores = []

        for r in results:
            details[r.source] = r
            total_records += r.total_records
            total_accepted += r.accepted
            total_rejected += r.rejected
            quality_scores.append(r.data_quality_score)

        avg_quality = round(sum(quality_scores) / max(1, len(quality_scores)), 3)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        report = IngestionReport(
            sources_processed=target_sources,
            total_records=total_records,
            total_accepted=total_accepted,
            total_rejected=total_rejected,
            average_quality_score=avg_quality,
            duration_ms=duration_ms,
            details=details,
        )

        logger.info(
            "Multi-department ingestion batch completed",
            total_accepted=total_accepted,
            total_rejected=total_rejected,
            duration_ms=duration_ms,
            avg_quality=avg_quality,
        )

        return report
