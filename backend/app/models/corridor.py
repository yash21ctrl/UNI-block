"""
Corridor ORM Model representing an Indian Railways operating section.
"""

from typing import TYPE_CHECKING, List
from sqlalchemy import String, Float, Integer, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.maintenance import MaintenanceTask
    from app.models.timetable import TrainTimetable
    from app.models.block_plan import BlockPlan


class Corridor(Base, TimestampMixin):
    """
    Railway corridor/section metadata (e.g., NDLS-AGC, AGC-JHS).
    Tracks traffic capacity, block windows, and infrastructure characteristics.
    """

    __tablename__ = "corridors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    section_code: Mapped[str] = mapped_column(
        String(32), unique=True, index=True, nullable=False
    )
    section_name: Mapped[str] = mapped_column(String(128), nullable=False)
    total_km: Mapped[float] = mapped_column(Float, nullable=False)
    daily_trains: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    goods_forecast: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    block_window_start: Mapped[str] = mapped_column(
        String(8), default="00:00:00", nullable=False
    )
    block_window_end: Mapped[str] = mapped_column(
        String(8), default="05:00:00", nullable=False
    )
    max_concurrent_blocks: Mapped[int] = mapped_column(
        Integer, default=2, nullable=False
    )
    is_double_line: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    assets: Mapped[List["Asset"]] = relationship(
        "Asset", back_populates="corridor", cascade="all, delete-orphan"
    )
    tasks: Mapped[List["MaintenanceTask"]] = relationship(
        "MaintenanceTask", back_populates="corridor", cascade="all, delete-orphan"
    )
    timetables: Mapped[List["TrainTimetable"]] = relationship(
        "TrainTimetable", back_populates="corridor", cascade="all, delete-orphan"
    )
    block_plans: Mapped[List["BlockPlan"]] = relationship(
        "BlockPlan", back_populates="corridor"
    )

    __table_args__ = (
        Index("ix_corridors_section_double_line", "section_code", "is_double_line"),
    )

    def __repr__(self) -> str:
        return f"<Corridor(code='{self.section_code}', name='{self.section_name}', km={self.total_km})>"
