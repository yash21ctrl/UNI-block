"""
Pydantic Schemas for Corridor entities.
"""

from datetime import datetime
from typing import Optional
from pydantic import Field
from app.schemas.common import ORMBaseModel


class CorridorBase(ORMBaseModel):
    section_code: str = Field(
        ...,
        min_length=3,
        max_length=32,
        description="Standard railway section code, e.g., NDLS-AGC",
        examples=["NDLS-AGC"],
    )
    section_name: str = Field(
        ...,
        min_length=3,
        max_length=128,
        description="Full descriptive railway section name",
        examples=["New Delhi - Agra Cantt"],
    )
    total_km: float = Field(
        ...,
        gt=0,
        description="Total section length in route kilometers",
        examples=[195.5],
    )
    daily_trains: int = Field(
        100,
        ge=0,
        description="Average daily passenger and express train volume",
        examples=[120],
    )
    goods_forecast: int = Field(
        30,
        ge=0,
        description="Forecasted daily freight rake paths",
        examples=[35],
    )
    block_window_start: str = Field(
        "00:00:00",
        pattern=r"^\d{2}:\d{2}:\d{2}$",
        description="Scheduled daily maintenance window start (HH:MM:SS)",
        examples=["00:00:00"],
    )
    block_window_end: str = Field(
        "05:00:00",
        pattern=r"^\d{2}:\d{2}:\d{2}$",
        description="Scheduled daily maintenance window end (HH:MM:SS)",
        examples=["05:00:00"],
    )
    max_concurrent_blocks: int = Field(
        2,
        ge=1,
        le=10,
        description="Maximum simultaneous maintenance blocks permitted on section",
        examples=[2],
    )
    is_double_line: bool = Field(
        True,
        description="Whether section features double/multiple track lines",
        examples=[True],
    )


class CorridorCreate(CorridorBase):
    """Schema for registering a new railway corridor."""
    pass


class CorridorUpdate(ORMBaseModel):
    """Schema for updating operational corridor parameters."""
    section_name: Optional[str] = Field(None, max_length=128)
    daily_trains: Optional[int] = Field(None, ge=0)
    goods_forecast: Optional[int] = Field(None, ge=0)
    block_window_start: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}:\d{2}$")
    block_window_end: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}:\d{2}$")
    max_concurrent_blocks: Optional[int] = Field(None, ge=1, le=10)
    is_double_line: Optional[bool] = None


class CorridorRead(CorridorBase):
    """Schema returned to API clients for a corridor entity."""
    id: int = Field(..., description="Unique database identifier")
    created_at: datetime
    updated_at: datetime
