"""
Pydantic Schemas for Maintenance Task entities.
"""

from datetime import datetime
from typing import Optional, Any
from pydantic import Field
from app.schemas.common import ORMBaseModel
from app.models.enums import Department


class MaintenanceTaskBase(ORMBaseModel):
    defect_id: Optional[int] = Field(
        None,
        description="Associated defect ID if corrective maintenance",
        examples=[45],
    )
    asset_id: int = Field(
        ...,
        gt=0,
        description="Target infrastructure asset ID",
        examples=[101],
    )
    corridor_id: int = Field(
        ...,
        gt=0,
        description="Operating corridor ID",
        examples=[1],
    )
    department: Department = Field(
        ...,
        description="Department responsible for execution",
        examples=[Department.ENGINEERING],
    )
    task_type: str = Field(
        ...,
        max_length=128,
        description="Maintenance operation name",
        examples=["Through Rail Renewal (TRR)"],
    )
    priority_score: float = Field(
        50.0,
        ge=0.0,
        le=100.0,
        description="Priority Agent ML composite score (0-100)",
        examples=[88.5],
    )
    duration_minutes: int = Field(
        180,
        ge=30,
        le=720,
        description="Required block duration in minutes",
        examples=[240],
    )
    needs_power_block: bool = Field(
        False,
        description="Whether OHE de-energization is required",
        examples=[False],
    )
    needs_traffic_block: bool = Field(
        True,
        description="Whether track possession and train halting are required",
        examples=[True],
    )
    can_combine: bool = Field(
        True,
        description="Whether task is eligible for multi-department block fusion",
        examples=[True],
    )
    resources_json: dict[str, Any] = Field(
        default_factory=dict,
        description="Required machinery, gangs, and equipment",
        examples=[{"machinery": ["BCM", "CSM-Tamping"], "gang_strength": 18}],
    )
    is_scheduled: bool = Field(
        False,
        description="Whether task has been assigned an active block plan",
        examples=[False],
    )


class MaintenanceTaskCreate(MaintenanceTaskBase):
    """Schema for registering a maintenance task."""
    pass


class MaintenanceTaskUpdate(ORMBaseModel):
    """Schema for updating task priority or scheduling status."""
    priority_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    duration_minutes: Optional[int] = Field(None, ge=30, le=720)
    needs_power_block: Optional[bool] = None
    needs_traffic_block: Optional[bool] = None
    can_combine: Optional[bool] = None
    resources_json: Optional[dict[str, Any]] = None
    is_scheduled: Optional[bool] = None


class MaintenanceTaskRead(MaintenanceTaskBase):
    """Schema returned for maintenance task queries."""
    id: int = Field(..., description="Unique database identifier")
    created_at: datetime
    updated_at: datetime
