"""
Pydantic Schemas for Multi-Agent Workflows:
- Ingestion, Priority Scoring, and Orchestration (Phase 2)
- Work Packages, CP-SAT Block Optimization, Pareto Front, Conflict Detection, Emergency Re-opt (Phase 3)
"""

from datetime import datetime, timezone
from typing import Optional, Any, Literal
from pydantic import Field
from app.schemas.common import ORMBaseModel
from app.models.enums import BlockType, Department, PlanType


# ==========================================
# PHASE 2 SCHEMAS (Ingestion & Priority)
# ==========================================

class SourceResult(ORMBaseModel):
    """Result summary of single source ingestion adapter."""
    source: str = Field(..., description="System identifier (TMS, SMMS, TDMS, COA)")
    total_records: int = Field(..., description="Raw records read from system export")
    accepted: int = Field(..., description="Normalized records passing quality firewall")
    rejected: int = Field(..., description="Defective records discarded")
    warnings: list[str] = Field(default_factory=list, description="Non-fatal data issues")
    duration_ms: float = Field(..., description="Processing time in milliseconds")
    sample_accepted_ids: list[str] = Field(default_factory=list, description="Sample identifiers accepted")
    data_quality_score: float = Field(..., ge=0.0, le=1.0, description="Quality index (0.0 to 1.0)")


class IngestionReport(ORMBaseModel):
    """Aggregated report across all ingestion feeds."""
    sources_processed: list[str]
    total_records: int
    total_accepted: int
    total_rejected: int
    average_quality_score: float
    duration_ms: float
    details: dict[str, SourceResult]


class IngestRequest(ORMBaseModel):
    """Payload for triggering data ingestion."""
    sources: Optional[list[str]] = Field(
        default=["TMS", "SMMS", "TDMS", "COA"],
        description="List of subsystems to ingest from",
    )


class TopFeature(ORMBaseModel):
    """Local SHAP feature attribution element."""
    feature: str
    shap_value: float
    direction: str = Field(..., description="INCREASES_URGENCY, DECREASES_URGENCY, or NEUTRAL")
    value: Optional[Any] = None


class PriorityDecision(ORMBaseModel):
    """Output contract for Priority Agent scoring decision."""
    task_id: int
    priority_score: float = Field(..., ge=0.0, le=100.0, description="Calculated urgency score 0-100")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Decision certainty score")
    top_features: list[TopFeature] = Field(default_factory=list, description="Top SHAP feature attributions")
    explanation_text: str = Field(..., max_length=512, description="Plain language explanation (max 2 sentences)")
    model_version: str = Field("xgb_priority_v1.0", description="Trained model version identifier")
    tqi: Optional[float] = Field(None, description="Track Quality Index (RDSO standard)")
    oms_peak_acceleration_g: Optional[float] = Field(None, description="Oscillation Monitoring System peak acceleration in g")
    cumulative_gmt: Optional[float] = Field(None, description="Gross Million Tonnes cumulative traffic loading")
    estimated_propagation_hours: Optional[int] = Field(None, description="Estimated hours until micro-flaw reaches critical threshold")
    shadow_pack_benefits: Optional[dict[str, Any]] = Field(None, description="Multi-department shadow block packing breakdown")


class TrainingReport(ORMBaseModel):
    """Model training performance and validation metrics."""
    model_version: str
    r2_score: float = Field(..., description="Holdout R2 performance score")
    mae: float = Field(..., description="Mean Absolute Error on holdout set")
    rmse: float = Field(..., description="Root Mean Squared Error on holdout set")
    cv_scores: list[float] = Field(default_factory=list, description="Cross validation R2 folds")
    cv_mean_r2: float = Field(..., description="Mean CV R2 score across all folds")
    training_samples: int
    test_samples: int
    top_features: list[str]
    model_path: str
    metadata_path: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Explanation(ORMBaseModel):
    """Detailed explainability narrative with SHAP values."""
    task_id: int
    priority_score: float
    natural_language_explanation: str
    shap_contributions: list[TopFeature]
    risk_tier: str = Field(..., description="CRITICAL, HIGH, MEDIUM, or ROUTINE")
    tqi: Optional[float] = None
    oms_peak_acceleration_g: Optional[float] = None
    cumulative_gmt: Optional[float] = None
    estimated_propagation_hours: Optional[int] = None


class TaskScoreRequest(ORMBaseModel):
    """Request payload for scoring an individual task."""
    task_id: Optional[int] = Field(None, description="Existing task ID in database")
    task_payload: Optional[dict[str, Any]] = Field(None, description="Ad-hoc task feature dictionary")


class BatchScoreRequest(ORMBaseModel):
    """Request payload for batch scoring maintenance tasks."""
    task_ids: Optional[list[int]] = Field(None, description="Explicit list of task IDs to score")
    limit: Optional[int] = Field(100, ge=1, le=5000, description="Maximum tasks to score from database")


class BatchScoreResponse(ORMBaseModel):
    """Summary of batch scoring operation."""
    total_scored: int
    mean_priority_score: float
    high_urgency_count: int
    decisions: list[PriorityDecision]


class PipelineRunResponse(ORMBaseModel):
    """Contract returned after complete Orchestrator priority execution."""
    status: str = "COMPLETED"
    ingestion_summary: Optional[IngestionReport] = None
    tasks_scored: int
    decisions_persisted: int
    duration_ms: float


# ==========================================
# PHASE 3 SCHEMAS (Fusion & Optimizer)
# ==========================================

class WorkPackage(ORMBaseModel):
    """
    Fused cluster of compatible multi-department maintenance tasks sharing
    a single integrated track/power possession window.
    """
    package_id: str = Field(..., description="Unique work package identifier, e.g. PKG-NDLS-AGC-001")
    section: str = Field(..., description="Corridor section code, e.g. NDLS-AGC")
    tasks: list[int] = Field(..., description="List of member maintenance task IDs")
    departments: list[str] = Field(..., description="Participating departments (Engineering, S&T, TRD)")
    total_duration_minutes: int = Field(..., description="Unified possession window duration in minutes")
    required_block_type: BlockType = Field(BlockType.INTEGRATED_BLOCK, description="Resulting block classification")
    fusion_benefit_minutes: int = Field(..., description="Downtime minutes saved vs isolated consecutive blocks")
    earliest_start: Optional[datetime] = None
    latest_end: Optional[datetime] = None
    reason: str = Field(..., description="Operational rationale explaining why tasks were co-located")
    individual_durations: dict[str, int] = Field(default_factory=dict, description="Task duration mapping")
    shadow_tasks: list[int] = Field(default_factory=list, description="Co-located secondary shadow tasks (S&T / TRD)")
    shadow_downtime_saved_minutes: int = Field(0, description="Downtime minutes saved by shadow packing inside primary possession")


class WorkPackageAnalysisRequest(ORMBaseModel):
    """Request payload for Fusion Agent analysis."""
    section: Optional[str] = None
    task_ids: Optional[list[int]] = None
    tasks_payload: Optional[list[dict[str, Any]]] = None


class WorkPackageAnalysisResponse(ORMBaseModel):
    """Analysis summary produced by Fusion Agent."""
    total_tasks_evaluated: int
    fused_packages_count: int
    standalone_tasks_count: int
    total_downtime_saved_minutes: int
    packages: list[WorkPackage]


class OptimizedBlock(ORMBaseModel):
    """A scheduled block possession assignment produced by CP-SAT."""
    block_id: str
    package_id: Optional[str] = None
    task_id: Optional[int] = None
    task_ids: list[int] = Field(default_factory=list)
    section: str
    department: str
    block_type: BlockType = BlockType.INTEGRATED_BLOCK
    scheduled_start: datetime
    scheduled_end: datetime
    duration_minutes: int
    priority_score: float
    confidence: float = 0.95
    conflict_score: float = 0.0
    downtime_saved_minutes: int = 0
    reason: str = ""


class OptimizedPlan(ORMBaseModel):
    """Complete weekly or monthly block schedule output by the Optimizer Agent."""
    plan_id: str
    plan_type: PlanType = PlanType.WEEKLY
    section: Optional[str] = None
    horizon_days: int = 7
    blocks: list[OptimizedBlock]
    total_tasks: int
    scheduled_tasks: int
    unscheduled_tasks: int
    total_downtime_minutes: int
    fusion_count: int
    fusion_benefit_minutes: int
    solve_status: str = Field("OPTIMAL", description="OPTIMAL, FEASIBLE, or INFEASIBLE")
    solve_time_ms: float
    objective_breakdown: dict[str, Any] = Field(default_factory=dict)
    violations: list[str] = Field(default_factory=list)


class ParetoResponse(ORMBaseModel):
    """3 distinct plans along the Pareto frontier (Safety-Max, Throughput-Max, Balanced)."""
    plans: dict[str, OptimizedPlan]
    comparison_metrics: dict[str, Any]


class ConflictDetail(ORMBaseModel):
    """Diagnostic detail of a detected or auto-resolved schedule conflict."""
    conflict_type: str = Field(..., description="TRAIN_OVERLAP, BLOCK_OVERLAP, POWER_HEADWAY, CAPACITY")
    severity: Literal["HARD", "SOFT", "RESOLVED"] = "HARD"
    block_a_id: str
    block_b_id: Optional[str] = None
    description: str
    auto_resolved: bool = False
    resolution_action: Optional[str] = None


class ConflictReport(ORMBaseModel):
    """Schedule validation audit produced by ConflictDetector."""
    is_valid: bool
    hard_violations_count: int
    soft_warnings_count: int
    auto_resolved_count: int
    conflicts: list[ConflictDetail] = Field(default_factory=list)


class OptimizeRequest(ORMBaseModel):
    """Request parameters for CP-SAT schedule generation."""
    plan_type: PlanType = PlanType.WEEKLY
    section: Optional[str] = None
    horizon_days: int = 7
    task_ids: Optional[list[int]] = None
    tasks_payload: Optional[list[dict[str, Any]]] = None
    pareto_profile: Literal["Safety-Max", "Throughput-Max", "Balanced"] = "Balanced"
    enable_fusion: bool = True
    persist_to_db: bool = False


class EmergencyReoptRequest(ORMBaseModel):
    """Payload to trigger < 5-second emergency re-optimization."""
    emergency_task: dict[str, Any]
    current_plan_id: Optional[str] = None
    freeze_approved: bool = True


class EmergencyReoptResponse(ORMBaseModel):
    """Result of real-time emergency slot insertion."""
    emergency_task_id: int
    reoptimized_plan: OptimizedPlan
    emergency_block: OptimizedBlock
    solve_time_ms: float
    premium_trains_protected: bool
    delta_summary: dict[str, Any]


class WhatIfSimulationRequest(ORMBaseModel):
    """Simulation request evaluating altered corridor conditions."""
    section: str
    additional_traffic_percent: float = 0.0
    restricted_window_hours: Optional[float] = None
    tasks_payload: Optional[list[dict[str, Any]]] = None


class FullPlanRequest(ORMBaseModel):
    """Request for complete end-to-end multi-agent pipeline."""
    plan_type: PlanType = PlanType.WEEKLY
    section: Optional[str] = None
    horizon_days: int = 7
    pareto_profile: Literal["Safety-Max", "Throughput-Max", "Balanced"] = "Balanced"
    persist_to_db: bool = True


class FullPlanResult(ORMBaseModel):
    """End-to-end multi-agent execution outcome."""
    plan_id: str
    plan_type: PlanType
    section: Optional[str]
    optimized_plan: OptimizedPlan
    conflict_report: ConflictReport
    work_packages_count: int
    db_records_created: int
    total_duration_ms: float
    safety_certificate: Optional[dict[str, Any]] = None
    plan_explanation: Optional[dict[str, Any]] = None


class PlanApprovalRequest(ORMBaseModel):
    """Payload for Controller plan approval with digital sign-off."""
    user_id: int = 1
    digital_signature: Optional[str] = None
    remarks: str = "Approved by Section Controller"


class PlanRejectionRequest(ORMBaseModel):
    """Payload for Controller plan rejection and reason recording."""
    user_id: int = 1
    reason: str = "Operational conflict with high-density passenger movements"
    details: Optional[dict[str, Any]] = None


# ==========================================
# PHASE 6 SCHEMAS (Station Master Deferral & Field JE Portal)
# ==========================================

class GroundDeferralRequest(ORMBaseModel):
    """Payload when Station Master defers an approved block due to local ground hazard."""
    block_id: str = Field(..., description="Target block ID being deferred")
    station_id: str = Field(..., description="Station code where hazard struck, e.g. MYA, SBC")
    deferral_reason: str = Field("Severe Weather Storm", description="Reason: Storm / Shunting Delay / Platform Obstruction / Late Passenger Train")
    deferred_at: Optional[str] = Field(None, description="ISO timestamp of deferral")


class GroundDeferralResponse(ORMBaseModel):
    """Response containing the auto-healed reschedule slot and status."""
    status: str = "DEFERRED"
    block_id: str
    station_id: str
    deferral_reason: str
    new_scheduled_slot: dict[str, Any]
    solve_time_ms: float
    notification_message: str
    updated_plan: Optional[dict[str, Any]] = None


class FieldDemandRequest(ORMBaseModel):
    """Payload when Field Junior Engineer submits block demand from mobile portal."""
    department: Department = Field(..., description="Engineering, Signal & Telecom, or Traction Distribution")
    section: str = Field(..., description="Corridor section code, e.g. SBC-MYS")
    km_from: float = Field(..., ge=0.0)
    km_to: float = Field(..., ge=0.0)
    duration_minutes: int = Field(..., ge=30, le=480)
    reason: str = Field(..., description="Defect or maintenance justification")
    submitter_name: str = Field("Field JE Mandya", description="Name of submitting JE")


class FieldDemandResponse(ORMBaseModel):
    """Response returned to Field JE upon successful demand registration."""
    task_id: int
    status: str = "SUBMITTED"
    department: str
    section: str
    priority_score: float
    message: str

