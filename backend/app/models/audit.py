"""
Audit Log ORM Model tracking human-in-the-loop decisions and system mutations.
"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, Any
from sqlalchemy import (
    String,
    Integer,
    DateTime,
    ForeignKey,
    Index,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class AuditLog(Base):
    """
    Immutable audit trail recording every approval, rejection, manual override,
    and agent trigger across RailBlock AI.
    """

    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action: Mapped[str] = mapped_column(
        String(64), index=True, nullable=False
    )  # e.g. "APPROVE_BLOCK", "REJECT_BLOCK", "EMERGENCY_REOPTIMIZE"
    entity_type: Mapped[str] = mapped_column(
        String(64), index=True, nullable=False
    )  # e.g. "block_plans", "maintenance_tasks"
    entity_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    before_json: Mapped[dict[str, Any]] = mapped_column(
        JSON, default=dict, nullable=False
    )
    after_json: Mapped[dict[str, Any]] = mapped_column(
        JSON, default=dict, nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False,
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="audit_logs")

    __table_args__ = (
        Index("ix_audit_log_entity_action", "entity_type", "entity_id", "action"),
    )

    def __repr__(self) -> str:
        return f"<AuditLog(action='{self.action}', entity='{self.entity_type}:{self.entity_id}', ts='{self.timestamp}')>"
