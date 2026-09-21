"""
Block Plan ORM Model representing synthesized weekly/monthly maintenance blocks.
"""

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional, Any
from sqlalchemy import (
    String,
    Float,
    Integer,
    DateTime,
    ForeignKey,
    Index,
    JSON,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
from app.models.enums import Department, BlockType, PlanType, PlanStatus

if TYPE_CHECKING:
    from app.models.maintenance import MaintenanceTask
    from app.models.corridor import Corridor
    from app.models.user import User
    from app.models.ai_decision import AIDecision


class BlockPlan(Base, TimestampMixin):
    """
    Optimized maintenance block schedule produced by the Optimizer Agent (CP-SAT).
    Follows human-in-the-loop governance: AI proposes, Railway Controller disposes.
    """

    __tablename__ = "block_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plan_type: Mapped[PlanType] = mapped_column(
        SQLEnum(PlanType, name="plan_type_enum"),
        default=PlanType.WEEKLY,
        index=True,
        nullable=False,
    )
    task_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("maintenance_tasks.id", ondelete="CASCADE"), index=True, nullable=False
    )
    section: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    corridor_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("corridors.id", ondelete="SET NULL"), nullable=True, index=True
    )
    department: Mapped[Department] = mapped_column(
        SQLEnum(Department, name="plan_department_enum"),
        index=True,
        nullable=False,
    )
    block_type: Mapped[BlockType] = mapped_column(
        SQLEnum(BlockType, name="block_type_enum"),
        default=BlockType.INTEGRATED_BLOCK,
        index=True,
        nullable=False,
    )
    scheduled_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), index=True, nullable=False
    )
    scheduled_end: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), index=True, nullable=False
    )
    combined_with_json: Mapped[list[Any]] = mapped_column(
        JSON, default=list, nullable=False
    )  # List of companion task IDs executing under this shadow/integrated window
    conflict_score: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )  # 0.0 (zero conflict) to 1.0 (severe conflict)
    downtime_minutes: Mapped[int] = mapped_column(
        Integer, default=180, nullable=False
    )
    status: Mapped[PlanStatus] = mapped_column(
        SQLEnum(PlanStatus, name="plan_status_enum"),
        default=PlanStatus.PROPOSED,
        index=True,
        nullable=False,
    )
    approved_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    ai_confidence: Mapped[float] = mapped_column(
        Float, default=0.92, nullable=False
    )  # 0.0 to 1.0

    # Relationships
    task: Mapped["MaintenanceTask"] = relationship(
        "MaintenanceTask", back_populates="block_plans"
    )
    corridor: Mapped[Optional["Corridor"]] = relationship(
        "Corridor", back_populates="block_plans"
    )
    approver: Mapped[Optional["User"]] = relationship(
        "User", back_populates="approved_plans"
    )
    ai_decisions: Mapped[List["AIDecision"]] = relationship(
        "AIDecision", back_populates="block_plan", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_block_plans_schedule_window", "scheduled_start", "scheduled_end"),
        Index("ix_block_plans_section_status", "section", "status"),
    )

    def __repr__(self) -> str:
        return f"<BlockPlan(id={self.id}, section='{self.section}', type='{self.block_type}', status='{self.status}')>"
