"""
User ORM Model representing Indian Railways Controllers and Administrative Officers.
"""

from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import (
    String,
    Integer,
    Boolean,
    Index,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.block_plan import BlockPlan
    from app.models.audit import AuditLog


class User(Base, TimestampMixin):
    """
    Railway personnel authorized to review, approve, reject, or re-optimize block schedules.
    Roles:
    - SECTION_CONTROLLER: Day-to-day corridor train movement & block requests
    - CHIEF_CONTROLLER: Shift supervisor and multi-section block coordination
    - DRM: Divisional Railway Manager (Authorizes major traffic/power blocks)
    - GM: General Manager (Division-wide policy and emergency clearances)
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role_enum"),
        default=UserRole.SECTION_CONTROLLER,
        index=True,
        nullable=False,
    )
    department: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True
    )  # Operating, Engineering, S&T, Electrical (TRD)
    section: Mapped[Optional[str]] = mapped_column(
        String(32), nullable=True, index=True
    )  # Assigned corridor or division code
    can_approve: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )  # True for DRM, GM, Chief Controller
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    approved_plans: Mapped[List["BlockPlan"]] = relationship(
        "BlockPlan", back_populates="approver"
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog", back_populates="user"
    )

    __table_args__ = (
        Index("ix_users_role_can_approve", "role", "can_approve"),
    )

    def __repr__(self) -> str:
        return f"<User(name='{self.name}', email='{self.email}', role='{self.role}')>"
