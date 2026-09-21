"""
Maintenance Task ORM Model representing work items prioritized by the Priority Agent.
"""

from typing import TYPE_CHECKING, List, Optional, Any
from sqlalchemy import (
    String,
    Float,
    Integer,
    Boolean,
    ForeignKey,
    Index,
    JSON,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
from app.models.enums import Department

if TYPE_CHECKING:
    from app.models.defect import Defect
    from app.models.asset import Asset
    from app.models.corridor import Corridor
    from app.models.block_plan import BlockPlan


class MaintenanceTask(Base, TimestampMixin):
    """
    Actionable maintenance task derived from defect resolution or scheduled cyclical renewal.
    Scored (0-100) by the Priority Agent (XGBoost + SHAP).
    Fused across Engineering, S&T, and TRD by the Fusion Agent.
    """

    __tablename__ = "maintenance_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    defect_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("defects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    asset_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("assets.id", ondelete="CASCADE"), index=True, nullable=False
    )
    corridor_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("corridors.id", ondelete="CASCADE"), index=True, nullable=False
    )
    department: Mapped[Department] = mapped_column(
        SQLEnum(Department, name="task_department_enum"),
        index=True,
        nullable=False,
    )
    task_type: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    priority_score: Mapped[float] = mapped_column(
        Float, default=50.0, index=True, nullable=False
    )  # 0.0 to 100.0
    duration_minutes: Mapped[int] = mapped_column(
        Integer, default=180, nullable=False
    )
    needs_power_block: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    needs_traffic_block: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    can_combine: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    resources_json: Mapped[dict[str, Any]] = mapped_column(
        JSON, default=dict, nullable=False
    )  # Gang composition, heavy machinery (BCM, CSM), tower wagon
    is_scheduled: Mapped[bool] = mapped_column(
        Boolean, default=False, index=True, nullable=False
    )

    # Relationships
    defect: Mapped[Optional["Defect"]] = relationship("Defect", back_populates="tasks")
    asset: Mapped["Asset"] = relationship("Asset", back_populates="tasks")
    corridor: Mapped["Corridor"] = relationship("Corridor", back_populates="tasks")
    block_plans: Mapped[List["BlockPlan"]] = relationship(
        "BlockPlan", back_populates="task"
    )

    __table_args__ = (
        Index("ix_tasks_dept_priority", "department", "priority_score"),
        Index("ix_tasks_scheduled_corridor", "is_scheduled", "corridor_id"),
    )

    def __repr__(self) -> str:
        return f"<MaintenanceTask(id={self.id}, type='{self.task_type}', priority={self.priority_score:.1f}, scheduled={self.is_scheduled})>"
