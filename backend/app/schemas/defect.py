"""
Pydantic Schemas for Defect entities.
"""

from datetime import datetime
from typing import Optional
from pydantic import Field
from app.schemas.common import ORMBaseModel
from app.models.enums import SourceSystem, DefectStatus


class DefectBase(ORMBaseModel):
    asset_id: int = Field(
        ...,
        gt=0,
        description="Associated asset ID",
        examples=[101],
    )
    source_system: SourceSystem = Field(
        ...,
        description="Originating sensor / logging feed: TMS, SMMS, TDMS, COA",
        examples=[SourceSystem.TMS],
    )
    defect_type: str = Field(
        ...,
        max_length=128,
        description="Specific defect classification",
        examples=["Rail Fracture / Weld Flaw"],
    )
    severity: int = Field(
        3,
        ge=1,
        le=5,
        description="Defect severity rating (1=slight to 5=immediate hazard)",
        examples=[5],
    )
    reported_at: datetime = Field(
        ...,
        description="Timestamp when defect was logged by monitoring system",
    )
    overdue_days: int = Field(
        0,
        ge=0,
        description="Elapsed days beyond standard Indian Railways SLA for rectification",
        examples=[2],
    )
    status: DefectStatus = Field(
        DefectStatus.REPORTED,
        description="Current rectification state",
        examples=[DefectStatus.REPORTED],
    )
    description: str = Field(
        ...,
        min_length=5,
        description="Detailed operational description and engineering telemetry",
        examples=["Ultrasonic flaw detected at weld joint km 45/12 on UP line."],
    )
    estimated_duration_minutes: int = Field(
        120,
        ge=15,
        le=720,
        description="Estimated track/power possession required in minutes",
        examples=[180],
    )


class DefectCreate(DefectBase):
    """Schema for reporting a new defect from TMS/SMMS/TDMS/COA."""
    pass


class DefectUpdate(ORMBaseModel):
    """Schema for updating defect status or overdue days."""
    severity: Optional[int] = Field(None, ge=1, le=5)
    overdue_days: Optional[int] = Field(None, ge=0)
    status: Optional[DefectStatus] = None
    estimated_duration_minutes: Optional[int] = Field(None, ge=15, le=720)


class DefectRead(DefectBase):
    """Schema returned for defect queries."""
    id: int = Field(..., description="Unique database identifier")
    created_at: datetime
    updated_at: datetime
