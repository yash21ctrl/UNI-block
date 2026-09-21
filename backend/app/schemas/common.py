"""
Common Pydantic base models, response wrappers, and pagination constructs.
"""

from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ORMBaseModel(BaseModel):
    """Base Pydantic schema enabling automatic ORM attribute extraction."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class StandardResponse(BaseModel, Generic[T]):
    """Standardized API response wrapper."""
    success: bool = Field(True, description="Indicates request success status")
    message: str = Field("Operation completed successfully", description="Status message")
    data: Optional[T] = Field(None, description="Response payload")


class PaginatedResponse(BaseModel, Generic[T]):
    """Standardized pagination response structure."""
    items: list[T] = Field(..., description="List of items for current page")
    total: int = Field(..., description="Total number of items matching query")
    page: int = Field(1, ge=1, description="Current page index")
    page_size: int = Field(50, ge=1, le=1000, description="Number of items per page")
    total_pages: int = Field(..., description="Total pages available")
