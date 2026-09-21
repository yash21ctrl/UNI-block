"""
Defect ORM Model representing anomalies reported by TMS, SMMS, TDMS, and COA.
"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List
from sqlalchemy import (
    String,
    Integer,
    DateTime,
    Text,
    ForeignKey,
    Index,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
from app.models.enums import SourceSystem, DefectStatus

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.maintenance import MaintenanceTask


class Defect(Base, TimestampMixin):
    """
    Infrastructure defect or degradation record ingested from IR monitoring feeds.
    Feeds include:
    - TMS: Track geometric degradation, rail fissures, ultrasonic flaws
    - SMMS: Point detection failures, axle counter false resets, signal bulb faults
    - TDMS: OHE tension anomalies, carbon wear on contact wire, mast lean
    - COA: Dynamic driver speed restrictions and caution orders
    """

    __tablename__ = "defects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    asset_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("assets.id", ondelete="CASCADE"), index=True, nullable=False
    )
    source_system: Mapped[SourceSystem] = mapped_column(
        SQLEnum(SourceSystem, name="source_system_enum"),
        index=True,
        nullable=False,
    )
    defect_type: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    severity: Mapped[int] = mapped_column(Integer, default=3, nullable=False)  # 1 (low) to 5 (critical)
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False,
    )
    overdue_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[DefectStatus] = mapped_column(
        SQLEnum(DefectStatus, name="defect_status_enum"),
        default=DefectStatus.REPORTED,
        index=True,
        nullable=False,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    estimated_duration_minutes: Mapped[int] = mapped_column(
        Integer, default=120, nullable=False
    )

    # Relationships
    asset: Mapped["Asset"] = relationship("Asset", back_populates="defects")
    tasks: Mapped[List["MaintenanceTask"]] = relationship(
        "MaintenanceTask", back_populates="defect"
    )

    __table_args__ = (
        Index("ix_defects_status_severity", "status", "severity"),
        Index("ix_defects_source_reported", "source_system", "reported_at"),
    )

    def __repr__(self) -> str:
        return f"<Defect(id={self.id}, type='{self.defect_type}', severity={self.severity}, status='{self.status}')>"
