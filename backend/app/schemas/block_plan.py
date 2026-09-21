"""
Pydantic Schemas for Block Plan entities.
"""

from datetime import datetime
from typing import Optional, Any
from pydantic import Field
from app.schemas.common import ORMBaseModel
from app.models.enums import Department, BlockType, PlanType, PlanStatus


class BlockPlanBase(ORMBaseModel):
    plan_type: PlanType = Field(
        PlanType.WEEKLY,
        description="Planning horizon",
        examples=[PlanType.WEEKLY],
    )
    task_id: int = Field(
        ...,
        gt=0,
        description="Primary maintenance task ID",
        examples=[101],
    )
    section: str = Field(
        ...,
        max_length=32,
        description="Corridor section code",
        examples=["NDLS-AGC"],
    )
    corridor_id: Optional[int] = Field(
        None,
        description="Corridor ID",
        examples=[1],
    )
    department: Department = Field(
        ...,
        description="Primary executing department",
        examples=[Department.ENGINEERING],
    )
    block_type: BlockType = Field(
        BlockType.INTEGRATED_BLOCK,
        description="Block type (POWER_BLOCK, TRAFFIC_BLOCK, INTEGRATED_BLOCK, SHADOW_BLOCK)",
        examples=[BlockType.INTEGRATED_BLOCK],
    )
    scheduled_start: datetime = Field(
        ...,
        description="Optimized start timestamp of the block window",
    )
    scheduled_end: datetime = Field(
        ...,
        description="Optimized end timestamp of the block window",
    )
    combined_with_json: list[Any] = Field(
        default_factory=list,
        description="List of combined/shadow maintenance task IDs",
        examples=[[102, 105]],
    )
    conflict_score: float = Field(
        0.0,
        ge=0.0,
        le=1.0,
        description="Computed conflict score with passenger trains (0=zero conflict)",
        examples=[0.05],
    )
    downtime_minutes: int = Field(
        180,
        ge=30,
        le=720,
        description="Total corridor possession window duration in minutes",
        examples=[240],
    )
    status: PlanStatus = Field(
        PlanStatus.PROPOSED,
        description="Approval state",
        examples=[PlanStatus.PROPOSED],
    )
    approved_by: Optional[int] = Field(
        None,
        description="User ID of approving Railway Controller / DRM",
    )
    ai_confidence: float = Field(
        0.92,
        ge=0.0,
        le=1.0,
        description="AI confidence score calculated by Optimizer and Guardian agents",
        examples=[0.94],
    )


class BlockPlanCreate(BlockPlanBase):
    """Schema for creating a proposed block plan."""
    pass


class BlockPlanUpdate(ORMBaseModel):
    """Schema for modifying block timings or status."""
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    status: Optional[PlanStatus] = None
    approved_by: Optional[int] = None
    conflict_score: Optional[float] = Field(None, ge=0.0, le=1.0)


class BlockPlanApproval(ORMBaseModel):
    """Schema for Controller human-in-the-loop approval or rejection."""
    approved: bool = Field(..., description="True to approve, False to reject")
    remarks: str = Field(..., min_length=3, description="Official operational justification")


class BlockPlanRead(BlockPlanBase):
    """Schema returned for block plan queries."""
    id: int = Field(..., description="Unique database identifier")
    created_at: datetime
    updated_at: datetime
