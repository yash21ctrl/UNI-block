"""
RailBlock AI SQLAlchemy ORM models package.
Aggregates all entities for migration and session discovery.
"""

from app.models.base import Base, TimestampMixin
from app.models.enums import (
    Department,
    SourceSystem,
    DefectStatus,
    TaskType,
    BlockType,
    PlanType,
    PlanStatus,
    UserRole,
    TrainType,
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

__all__ = [
    "Base",
    "TimestampMixin",
    "Department",
    "SourceSystem",
    "DefectStatus",
    "TaskType",
    "BlockType",
    "PlanType",
    "PlanStatus",
    "UserRole",
    "TrainType",
    "Corridor",
    "Asset",
    "Defect",
    "MaintenanceTask",
    "TrainTimetable",
    "BlockPlan",
    "User",
    "AuditLog",
    "AIDecision",
]
