"""
Health Check and System Diagnostics Router for RailBlock AI.
"""

from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy import text, select, func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.corridor import Corridor
from app.models.asset import Asset
from app.models.maintenance import MaintenanceTask
from app.models.timetable import TrainTimetable
from app.models.block_plan import BlockPlan

router = APIRouter(tags=["System Health & Diagnostics"])


@router.get("/health", summary="Service Health & Connectivity Status")
def health_check(db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Checks backend service availability and database connectivity.
    """
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        db_status = f"error: {str(exc)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get(f"{settings.API_V1_STR}/metrics", summary="Corridor & Maintenance Operational Metrics")
def system_metrics(db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Returns high-level statistics across Indian Railways sections, assets, and blocks.
    """
    total_corridors = db.execute(select(func.count(Corridor.id))).scalar() or 0
    total_assets = db.execute(select(func.count(Asset.id))).scalar() or 0
    total_tasks = db.execute(select(func.count(MaintenanceTask.id))).scalar() or 0
    scheduled_tasks = db.execute(
        select(func.count(MaintenanceTask.id)).where(MaintenanceTask.is_scheduled == True)  # noqa: E712
    ).scalar() or 0
    total_trains = db.execute(select(func.count(TrainTimetable.id))).scalar() or 0
    total_plans = db.execute(select(func.count(BlockPlan.id))).scalar() or 0

    return {
        "corridors_count": total_corridors,
        "assets_count": total_assets,
        "maintenance_tasks_count": total_tasks,
        "scheduled_tasks_count": scheduled_tasks,
        "train_schedules_count": total_trains,
        "block_plans_count": total_plans,
        "system_status": "OPERATIONAL",
    }
