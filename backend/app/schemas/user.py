"""
Pydantic Schemas for User and Authentication entities.
"""

from datetime import datetime
from typing import Optional
from pydantic import EmailStr, Field
from app.schemas.common import ORMBaseModel
from app.models.enums import UserRole


class UserBase(ORMBaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=128,
        description="Full name of Railway official",
        examples=["Rajesh Sharma"],
    )
    email: EmailStr = Field(
        ...,
        description="Official railway email address",
        examples=["rajesh.sharma@nr.railnet.gov.in"],
    )
    role: UserRole = Field(
        UserRole.SECTION_CONTROLLER,
        description="Official railway operational role",
        examples=[UserRole.CHIEF_CONTROLLER],
    )
    department: Optional[str] = Field(
        None,
        description="Assigned railway department",
        examples=["Operating"],
    )
    section: Optional[str] = Field(
        None,
        description="Jurisdiction section code",
        examples=["NDLS-AGC"],
    )
    can_approve: bool = Field(
        False,
        description="Whether user holds authority to approve maintenance blocks",
        examples=[True],
    )
    is_active: bool = Field(True, description="Account active status")


class UserCreate(UserBase):
    """Schema for registering a new user."""
    password: str = Field(
        ...,
        min_length=8,
        description="Secure password for authentication",
        examples=["RailBlockSecure@2026"],
    )


class UserUpdate(ORMBaseModel):
    """Schema for updating user details."""
    name: Optional[str] = Field(None, min_length=2, max_length=128)
    role: Optional[UserRole] = None
    department: Optional[str] = None
    section: Optional[str] = None
    can_approve: Optional[bool] = None
    is_active: Optional[bool] = None


class UserRead(UserBase):
    """Schema returned for user queries (omits hashed password)."""
    id: int = Field(..., description="Unique database identifier")
    created_at: datetime
    updated_at: datetime


class UserLogin(ORMBaseModel):
    """Schema for user credentials login."""
    email: EmailStr = Field(..., examples=["controller@railblock.indianrail.gov.in"])
    password: str = Field(..., examples=["RailBlock@2026"])


class TokenResponse(ORMBaseModel):
    """Schema returned upon successful authentication."""
    access_token: str
    token_type: str = "bearer"
    user: UserRead
