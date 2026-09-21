"""
Train Timetable ORM Model designed as a TimescaleDB Hypertable for real-time corridor operations.
"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import (
    String,
    Integer,
    DateTime,
    ForeignKey,
    Index,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
from app.models.enums import TrainType

if TYPE_CHECKING:
    from app.models.corridor import Corridor


class TrainTimetable(Base, TimestampMixin):
    """
    Time-series train schedules across Indian Railways corridors.
    Partitioned as a TimescaleDB hypertable on arrival_time.
    Used by the Guardian and Optimizer agents to calculate train headways,
    avoid premium train disruption, and calculate passenger delay costs.
    """

    __tablename__ = "train_timetable"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    train_number: Mapped[str] = mapped_column(
        String(16), index=True, nullable=False
    )
    train_name: Mapped[str] = mapped_column(String(128), nullable=False)
    section: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    corridor_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("corridors.id", ondelete="SET NULL"), nullable=True, index=True
    )
    arrival_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        index=True,
        nullable=False,
    )
    departure_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    train_type: Mapped[TrainType] = mapped_column(
        SQLEnum(TrainType, name="train_type_enum"),
        index=True,
        nullable=False,
    )
    priority: Mapped[int] = mapped_column(
        Integer, default=5, nullable=False
    )  # 10 for Vande Bharat / Rajdhani, 8 for Shatabdi, 6 for Express, 3 for Goods
    day_of_week: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )  # 0=Monday to 6=Sunday

    # Relationships
    corridor: Mapped[Optional["Corridor"]] = relationship(
        "Corridor", back_populates="timetables"
    )

    __table_args__ = (
        Index("ix_timetable_section_arrival", "section", "arrival_time"),
        Index("ix_timetable_train_priority", "train_type", "priority"),
    )

    def __repr__(self) -> str:
        return f"<TrainTimetable(train='{self.train_number} {self.train_name}', section='{self.section}', arr='{self.arrival_time}')>"
