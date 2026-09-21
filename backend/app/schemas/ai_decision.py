"""
Pydantic Schemas for AI Decision and SHAP Explainability entities.
"""

from datetime import datetime
from typing import Any
from pydantic import Field
from app.schemas.common import ORMBaseModel


class AIDecisionBase(ORMBaseModel):
    plan_id: int = Field(
        ...,
        gt=0,
        description="Associated block plan ID",
        examples=[101],
    )
    agent_name: str = Field(
        ...,
        max_length=64,
        description="Originating multi-agent name (e.g., PriorityAgent, OptimizerAgent)",
        examples=["PriorityAgent"],
    )
    decision_json: dict[str, Any] = Field(
        default_factory=dict,
        description="Structured decision parameters and constraint evaluations",
    )
    explanation_text: str = Field(
        ...,
        description="Natural language explanation synthesized for Railway Controllers",
        examples=[
            "High priority assigned due to severe rail fracture risk on high GMT corridor "
            "NDLS-AGC with 4 overdue days. Scheduled during 01:00-04:00 shadow window to protect 12002 Shatabdi."
        ],
    )
    shap_values_json: dict[str, Any] = Field(
        default_factory=dict,
        description="Feature importance and local SHAP attributions explaining model output",
        examples=[{"traffic_density": 0.42, "overdue_days": 0.35, "defect_severity": 0.18}],
    )
    confidence: float = Field(
        0.95,
        ge=0.0,
        le=1.0,
        description="Agent decision confidence rating",
        examples=[0.96],
    )


class AIDecisionCreate(AIDecisionBase):
    """Schema for recording an AI decision."""
    pass


class AIDecisionRead(AIDecisionBase):
    """Schema returned for AI decision queries."""
    id: int = Field(..., description="Unique decision record ID")
    timestamp: datetime
