"""
Pydantic Schemas for Audit Log entities.
"""

from datetime import datetime
from typing import Optional, Any
from pydantic import Field
from app.schemas.common import ORMBaseModel


class AuditLogBase(ORMBaseModel):
    user_id: Optional[int] = Field(
        None,
        description="User who initiated the action (or None if system automated)",
        examples=[1],
    )
    action: str = Field(
        ...,
        max_length=64,
        description="Action performed (e.g. APPROVE_BLOCK, REJECT_BLOCK, DISPATCH_MEMO)",
        examples=["APPROVE_BLOCK"],
    )
    entity_type: str = Field(
        ...,
        max_length=64,
        description="Target entity table name",
        examples=["block_plans"],
    )
    entity_id: int = Field(
        ...,
        description="Target entity primary key identifier",
        examples=[101],
    )
    before_json: dict[str, Any] = Field(
        default_factory=dict,
        description="State snapshot prior to modification",
    )
    after_json: dict[str, Any] = Field(
        default_factory=dict,
        description="State snapshot following modification",
    )


class AuditLogCreate(AuditLogBase):
    """Schema for appending to audit trail."""
    pass


class AuditLogRead(AuditLogBase):
    """Schema returned for audit queries."""
    id: int = Field(..., description="Unique audit log ID")
    timestamp: datetime
