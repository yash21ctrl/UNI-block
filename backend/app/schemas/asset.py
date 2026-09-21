"""
Pydantic Schemas for Asset entities.
"""

from datetime import datetime
from typing import Optional
from pydantic import Field
from app.schemas.common import ORMBaseModel
from app.models.enums import Department


class AssetBase(ORMBaseModel):
    code: str = Field(
        ...,
        min_length=4,
        max_length=64,
        description="Unique Indian Railways asset identifier",
        examples=["AST-NDLS-AGC-TRK-0104"],
    )
    type: str = Field(
        ...,
        max_length=64,
        description="Asset category (e.g. Track Segment, Turnout, Signal, OHE Mast)",
        examples=["Turnout"],
    )
    department: Department = Field(
        ...,
        description="Owning department (Engineering, Signal & Telecom, Traction Distribution)",
        examples=[Department.ENGINEERING],
    )
    section: str = Field(
        ...,
        max_length=32,
        description="Corridor section code",
        examples=["NDLS-AGC"],
    )
    corridor_id: int = Field(
        ...,
        gt=0,
        description="Foreign key to corridor table",
        examples=[1],
    )
    km_from: float = Field(
        ...,
        ge=0,
        description="Start kilometer marking on section",
        examples=[45.2],
    )
    km_to: float = Field(
        ...,
        ge=0,
        description="End kilometer marking on section",
        examples=[46.0],
    )
    criticality: int = Field(
        3,
        ge=1,
        le=5,
        description="Asset criticality score (1=low to 5=mission critical)",
        examples=[4],
    )
    traffic_density: float = Field(
        35.0,
        ge=0,
        description="Traffic density in Gross Million Tonnes per annum (GMT)",
        examples=[42.8],
    )
    last_maintenance_at: Optional[datetime] = Field(
        None,
        description="Timestamp of last successful preventive or corrective maintenance",
    )


class AssetCreate(AssetBase):
    """Schema for registering a railway asset."""
    pass


class AssetUpdate(ORMBaseModel):
    """Schema for modifying asset telemetry or criticality."""
    criticality: Optional[int] = Field(None, ge=1, le=5)
    traffic_density: Optional[float] = Field(None, ge=0)
    last_maintenance_at: Optional[datetime] = None


class AssetRead(AssetBase):
    """Schema returned for asset queries."""
    id: int = Field(..., description="Unique database identifier")
    created_at: datetime
    updated_at: datetime
