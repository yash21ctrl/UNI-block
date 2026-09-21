"""
Database Seeding Script for RailBlock AI.
Executes end-to-end data initialization:
1. Railway Corridors (NDLS-AGC, AGC-JHS, etc.)
2. Certified Railway Controller & DRM Personnel
3. 500+ Physical Assets (Track, S&T, TRD)
4. 5000+ Historical Maintenance Tasks & Defects (TMS, SMMS, TDMS)
5. 250+ Train Timetable Records (TimescaleDB)
6. Sample Optimized Block Plans with AI Decisions (SHAP explainability) & Audit Trails.
"""

from datetime import datetime, timedelta, timezone
import time
import sys
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import SessionLocal, init_db
from app.core.security import get_password_hash
from app.core.logging import get_logger, setup_logging
from app.models.enums import (
    Department,
    BlockType,
    PlanType,
    PlanStatus,
    UserRole,
)
from app.models.corridor import Corridor
from app.models.asset import Asset
from app.models.defect import Defect
from app.models.maintenance import MaintenanceTask
from app.models.timetable import TrainTimetable
from app.models.block_plan import BlockPlan
from app.models.user import User
from app.models.audit import AuditLog
from app.models.ai_decision import AIDecision
from app.utils.synthetic_data import (
    generate_corridors,
    generate_assets,
    generate_defects_and_tasks,
    generate_train_timetables,
)

logger = get_logger("railblock.seed")


def seed_users(db: Session) -> list[User]:
    """
    Seeds initial Indian Railways operations personnel.
    """
    existing = db.execute(select(User)).scalars().first()
    if existing:
        logger.info("Users already seeded. Skipping user creation.")
        return list(db.execute(select(User)).scalars().all())

    users_data = [
        {
            "name": "Dr. Alok Verma, IRSE",
            "email": "drm.delhi@nr.railnet.gov.in",
            "password": "DRMPassword2026!",
            "role": UserRole.DRM,
            "department": "Administration",
            "section": "NDLS-AGC",
            "can_approve": True,
        },
        {
            "name": "Sanjay Kumar Mohanty, IRTS",
            "email": "gm.northern@railnet.gov.in",
            "password": "GMPassword2026!",
            "role": UserRole.GM,
            "department": "Executive",
            "section": "ALL",
            "can_approve": True,
        },
        {
            "name": "Vikramaditya Roy",
            "email": "chief.controller@railnet.gov.in",
            "password": "ChiefController2026!",
            "role": UserRole.CHIEF_CONTROLLER,
            "department": "Operating",
            "section": "NDLS-AGC",
            "can_approve": True,
        },
        {
            "name": "Amitabh Sen",
            "email": "sc.ndls@railnet.gov.in",
            "password": "Controller2026!",
            "role": UserRole.SECTION_CONTROLLER,
            "department": "Operating",
            "section": "NDLS-AGC",
            "can_approve": False,
        },
    ]

    users = []
    for u in users_data:
        user = User(
            name=u["name"],
            email=u["email"],
            hashed_password=get_password_hash(u["password"]),
            role=u["role"],
            department=u["department"],
            section=u["section"],
            can_approve=u["can_approve"],
            is_active=True,
        )
        db.add(user)
        users.append(user)

    db.commit()
    for u in users:
        db.refresh(u)
    logger.info("Seeded Indian Railways authorized personnel", count=len(users))
    return users


def seed_database(target_assets: int = 500, target_tasks: int = 5000, target_trains: int = 250) -> None:
    """
    Main seeding routine populating all canonical tables with realistic data.
    """
    start_time = time.perf_counter()
    setup_logging()
    logger.info("Starting RailBlock AI Database Seed Routine...")

    # Step 1: Ensure database schema exists
    init_db()

    db: Session = SessionLocal()
    try:
        # Step 2: Seed Users
        users = seed_users(db)

        # Step 3: Seed Corridors
        existing_corridors = db.execute(select(Corridor)).scalars().all()
        corridor_id_map: dict[str, int] = {}

        if not existing_corridors:
            logger.info("Seeding 12 Indian Railways primary corridors...")
            corridor_specs = generate_corridors()
            corridor_objects = []
            for c_spec in corridor_specs:
                corr = Corridor(**c_spec)
                db.add(corr)
                corridor_objects.append(corr)
            db.commit()
            for corr in corridor_objects:
                db.refresh(corr)
                corridor_id_map[corr.section_code] = corr.id
            logger.info("Corridors seeded successfully", count=len(corridor_objects))
        else:
            logger.info("Corridors already populated.", count=len(existing_corridors))
            for corr in existing_corridors:
                corridor_id_map[corr.section_code] = corr.id

        # Step 4: Seed Assets (500+)
        existing_asset_count = db.execute(select(func.count(Asset.id))).scalar() or 0
        asset_id_map: dict[str, int] = {}
        assets_data = []

        if existing_asset_count < target_assets:
            logger.info("Generating and seeding physical infrastructure assets...", target=target_assets)
            raw_assets = generate_assets(corridor_id_map, target_count=target_assets)
            
            # Batch insert in chunks of 200
            for chunk_start in range(0, len(raw_assets), 200):
                chunk = raw_assets[chunk_start:chunk_start + 200]
                asset_objs = [Asset(**a) for a in chunk]
                db.add_all(asset_objs)
                db.commit()

            # Retrieve map of codes to IDs
            all_assets = db.execute(select(Asset)).scalars().all()
            for a in all_assets:
                asset_id_map[a.code] = a.id
                assets_data.append({
                    "code": a.code,
                    "department": a.department,
                    "section": a.section,
                    "corridor_id": a.corridor_id,
                    "km_from": a.km_from,
                    "km_to": a.km_to,
                    "criticality": a.criticality,
                    "traffic_density": a.traffic_density,
                })
            logger.info("Assets seeded successfully", count=len(all_assets))
        else:
            logger.info("Assets already populated.", count=existing_asset_count)
            all_assets = db.execute(select(Asset)).scalars().all()
            for a in all_assets:
                asset_id_map[a.code] = a.id
                assets_data.append({
                    "code": a.code,
                    "department": a.department,
                    "section": a.section,
                    "corridor_id": a.corridor_id,
                    "km_from": a.km_from,
                    "km_to": a.km_to,
                    "criticality": a.criticality,
                    "traffic_density": a.traffic_density,
                })

        # Step 5: Seed Defects & Maintenance Tasks (5000+)
        existing_task_count = db.execute(select(func.count(MaintenanceTask.id))).scalar() or 0

        if existing_task_count < target_tasks:
            logger.info("Generating and seeding defects and maintenance tasks for ML...", target=target_tasks)
            raw_defects, raw_tasks = generate_defects_and_tasks(
                assets_data,
                asset_id_map,
                total_records=target_tasks,
            )

            # Insert defects in batches
            defect_id_list = []
            for chunk_start in range(0, len(raw_defects), 500):
                chunk = raw_defects[chunk_start:chunk_start + 500]
                defect_objs = [Defect(**d) for d in chunk]
                db.add_all(defect_objs)
                db.commit()
                for d in defect_objs:
                    defect_id_list.append(d.id)

            # Insert maintenance tasks referencing corresponding defects
            for chunk_start in range(0, len(raw_tasks), 500):
                chunk = raw_tasks[chunk_start:chunk_start + 500]
                task_objs = []
                for t in chunk:
                    d_idx = t.pop("defect_index", None)
                    d_id = defect_id_list[d_idx] if d_idx is not None and d_idx < len(defect_id_list) else None
                    task_objs.append(MaintenanceTask(defect_id=d_id, **t))
                db.add_all(task_objs)
                db.commit()

            logger.info("Defects and Maintenance Tasks seeded successfully", tasks=target_tasks)
        else:
            logger.info("Maintenance Tasks already populated.", count=existing_task_count)

        # Step 6: Seed Train Timetables (250+)
        existing_train_count = db.execute(select(func.count(TrainTimetable.id))).scalar() or 0
        if existing_train_count < target_trains:
            logger.info("Generating and seeding Train Timetables (TimescaleDB hypertable)...", target=target_trains)
            raw_timetables = generate_train_timetables(corridor_id_map, target_count=target_trains)
            for chunk_start in range(0, len(raw_timetables), 200):
                chunk = raw_timetables[chunk_start:chunk_start + 200]
                db.add_all([TrainTimetable(**tt) for tt in chunk])
                db.commit()
            logger.info("Train Timetables seeded successfully", count=len(raw_timetables))
        else:
            logger.info("Train Timetables already populated.", count=existing_train_count)

        # Step 7: Seed Sample Approved/Proposed Block Plans and AI Explanations
        existing_plans = db.execute(select(func.count(BlockPlan.id))).scalar() or 0
        if existing_plans == 0:
            logger.info("Synthesizing baseline multi-agent block plans and explainability traces...")
            sample_tasks = db.execute(
                select(MaintenanceTask).order_by(MaintenanceTask.priority_score.desc()).limit(10)
            ).scalars().all()

            drm_user = next((u for u in users if u.role == UserRole.DRM), users[0])
            now = datetime.now(timezone.utc)

            for idx, task in enumerate(sample_tasks):
                start_dt = now + timedelta(days=idx + 1, hours=1)
                end_dt = start_dt + timedelta(minutes=task.duration_minutes)

                plan = BlockPlan(
                    plan_type=PlanType.WEEKLY,
                    task_id=task.id,
                    section=task.corridor.section_code if task.corridor else "NDLS-AGC",
                    corridor_id=task.corridor_id,
                    department=task.department,
                    block_type=BlockType.INTEGRATED_BLOCK,
                    scheduled_start=start_dt,
                    scheduled_end=end_dt,
                    combined_with_json=[],
                    conflict_score=0.03 * (idx + 1),
                    downtime_minutes=task.duration_minutes,
                    status=PlanStatus.APPROVED if idx < 3 else PlanStatus.PROPOSED,
                    approved_by=drm_user.id if idx < 3 else None,
                    ai_confidence=0.94 - (0.01 * idx),
                )
                db.add(plan)
                db.commit()
                db.refresh(plan)

                # Add multi-agent explanation & SHAP traces
                ai_decision = AIDecision(
                    plan_id=plan.id,
                    agent_name="PriorityAgent + OptimizerAgent",
                    decision_json={
                        "optimizer": "Google OR-Tools CP-SAT",
                        "objective_delay_penalty": 12.5,
                        "window_utilized": f"{start_dt.strftime('%H:%M')} - {end_dt.strftime('%H:%M')}",
                        "pareto_rank": 1,
                    },
                    explanation_text=(
                        f"Maintenance task for {task.task_type} scheduled on {plan.section} "
                        f"during zero-traffic window ({start_dt.strftime('%H:%M')} to {end_dt.strftime('%H:%M')}). "
                        f"Zero passenger train conflicts detected with premium express headways intact."
                    ),
                    shap_values_json={
                        "defect_severity": round(0.35 + 0.05 * idx, 2),
                        "traffic_density_gmt": 0.28,
                        "safety_criticality": 0.22,
                        "overdue_penalty": 0.15,
                    },
                    confidence=plan.ai_confidence,
                )
                db.add(ai_decision)

                # Add audit log
                audit = AuditLog(
                    user_id=drm_user.id if plan.status == PlanStatus.APPROVED else None,
                    action="PROPOSE_BLOCK_PLAN" if plan.status == PlanStatus.PROPOSED else "APPROVE_BLOCK_PLAN",
                    entity_type="block_plans",
                    entity_id=plan.id,
                    before_json={},
                    after_json={"status": plan.status.value, "scheduled_start": start_dt.isoformat()},
                )
                db.add(audit)
                db.commit()

        # Step 8: Calculate Summary Statistics
        total_users = db.execute(select(func.count(User.id))).scalar() or 0
        total_corridors = db.execute(select(func.count(Corridor.id))).scalar() or 0
        total_assets = db.execute(select(func.count(Asset.id))).scalar() or 0
        total_defects = db.execute(select(func.count(Defect.id))).scalar() or 0
        total_tasks = db.execute(select(func.count(MaintenanceTask.id))).scalar() or 0
        total_trains = db.execute(select(func.count(TrainTimetable.id))).scalar() or 0
        total_plans = db.execute(select(func.count(BlockPlan.id))).scalar() or 0
        total_ai_decisions = db.execute(select(func.count(AIDecision.id))).scalar() or 0
        total_audit = db.execute(select(func.count(AuditLog.id))).scalar() or 0

        elapsed = time.perf_counter() - start_time

        # Print Beautiful Railway Summary Report (ASCII-safe for cross-platform terminals)
        print("\n" + "=" * 70)
        print(" [IR] RAILBLOCK AI -- DATABASE SEEDING SUMMARY (INDIAN RAILWAYS) [IR]")
        print("=" * 70)
        print(f" * Corridors (Sections):           {total_corridors:6d}  (NDLS-AGC, AGC-JHS, BRC-BVI, etc.)")
        print(f" * Railway Officials & DRM:       {total_users:6d}  (DRM, GM, Chief Controller, SC)")
        print(f" * Infrastructure Assets:         {total_assets:6d}  (Track, Turnout, Signals, OHE Masts)")
        print(f" * Detected Defects (TMS/SMMS):   {total_defects:6d}  (Rail Fractures, Signal Lamp, OHE Sag)")
        print(f" * Maintenance Tasks (ML Corpus): {total_tasks:6d}  (Scored 0-100 for Priority Agent)")
        print(f" * Train Timetable (TimescaleDB): {total_trains:6d}  (Vande Bharat, Rajdhani, Shatabdi)")
        print(f" * Optimized Block Plans:         {total_plans:6d}  (Weekly/Monthly Integrated Windows)")
        print(f" * AI Explainability Decisions:   {total_ai_decisions:6d}  (SHAP Feature Attributions)")
        print(f" * Immutable Audit Trail Records: {total_audit:6d}  (Human-in-the-Loop Logs)")
        print("-" * 70)
        print(f" + Seeding completed in {elapsed:.2f} seconds.")
        print("=" * 70 + "\n")

    except Exception as exc:
        db.rollback()
        logger.exception("Database seeding failed", error=str(exc))
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
