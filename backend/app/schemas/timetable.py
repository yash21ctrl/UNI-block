"""
Pydantic Schemas for Train Timetable entities.
"""

from datetime import datetime
from typing import Optional
from pydantic import Field
from app.schemas.common import ORMBaseModel
from app.models.enums import TrainType


class TrainTimetableBase(ORMBaseModel):
    train_number: str = Field(
        ...,
        min_length=4,
        max_length=16,
        description="Official 5-digit Indian Railways train number",
        examples=["12002"],
    )
    train_name: str = Field(
        ...,
        max_length=128,
        description="Official train name",
        examples=["Bhopal Shatabdi Express"],
    )
    section: str = Field(
        ...,
        max_length=32,
        description="Corridor section code",
        examples=["NDLS-AGC"],
    )
    corridor_id: Optional[int] = Field(
        None,
        description="Optional corridor foreign key",
        examples=[1],
    )
    arrival_time: datetime = Field(
        ...,
        description="Scheduled arrival at entry station of section",
    )
    departure_time: datetime = Field(
        ...,
        description="Scheduled departure from exit station of section",
    )
    train_type: TrainType = Field(
        ...,
        description="Train priority category",
        examples=[TrainType.SHATABDI],
    )
    priority: int = Field(
        5,
        ge=1,
        le=10,
        description="Operational priority (10=Vande Bharat/Rajdhani, 3=Goods)",
        examples=[8],
    )
    day_of_week: int = Field(
        0,
        ge=0,
        le=6,
        description="Day of week (0=Monday, 6=Sunday)",
        examples=[0],
    )


class TrainTimetableCreate(TrainTimetableBase):
    """Schema for adding train schedule to hypertable."""
    pass


class TrainTimetableUpdate(ORMBaseModel):
    """Schema for updating train run timings."""
    arrival_time: Optional[datetime] = None
    departure_time: Optional[datetime] = None
    priority: Optional[int] = Field(None, ge=1, le=10)


class TrainTimetableRead(TrainTimetableBase):
    """Schema returned for train schedule queries."""
    id: int = Field(..., description="Unique database identifier")
    created_at: datetime
    updated_at: datetime
