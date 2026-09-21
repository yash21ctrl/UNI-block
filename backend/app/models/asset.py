"""
Asset ORM Model representing physical railway infrastructure.
"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import (
    String,
    Float,
    Integer,
    DateTime,
    ForeignKey,
    Index,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
from app.models.enums import Department

if TYPE_CHECKING:
    from app.models.corridor import Corridor
    from app.models.defect import Defect
    from app.models.maintenance import MaintenanceTask


class Asset(Base, TimestampMixin):
    """
    Railway physical asset entity (Track segment, Signal, Point Machine, OHE Mast).
    Cross-references departmental hierarchy (Engineering, S&T, TRD).
    """

    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    type: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    department: Mapped[Department] = mapped_column(
        SQLEnum(Department, name="department_enum"),
        index=True,
        nullable=False,
    )
    section: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    corridor_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("corridors.id", ondelete="CASCADE"), index=True, nullable=False
    )
    km_from: Mapped[float] = mapped_column(Float, nullable=False)
    km_to: Mapped[float] = mapped_column(Float, nullable=False)
    criticality: Mapped[int] = mapped_column(Integer, default=3, nullable=False)  # 1 (lowest) to 5 (highest)
    traffic_density: Mapped[float] = mapped_column(
        Float, default=35.0, nullable=False
    )  # Gross Million Tonnes (GMT)
    last_maintenance_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=True,
    )

    # Relationships
    corridor: Mapped["Corridor"] = relationship("Corridor", back_populates="assets")
    defects: Mapped[List["Defect"]] = relationship(
        "Defect", back_populates="asset", cascade="all, delete-orphan"
    )
    tasks: Mapped[List["MaintenanceTask"]] = relationship(
        "MaintenanceTask", back_populates="asset", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_assets_section_km", "section", "km_from", "km_to"),
        Index("ix_assets_dept_criticality", "department", "criticality"),
    )

    def __repr__(self) -> str:
        return f"<Asset(code='{self.code}', type='{self.type}', dept='{self.department}', section='{self.section}')>"
