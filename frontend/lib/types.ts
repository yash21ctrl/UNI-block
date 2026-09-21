export type Department = 'Engineering' | 'Signal & Telecom' | 'Traction Distribution';

export type BlockType = 'TRAFFIC_BLOCK' | 'POWER_BLOCK' | 'INTEGRATED_BLOCK' | 'SHADOW_BLOCK';

export type PlanType = 'WEEKLY' | 'MONTHLY';

export type PlanStatus = 'DRAFT' | 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED';

export interface TopFeature {
  feature: string;
  shap_value: number;
  direction: 'INCREASES_URGENCY' | 'DECREASES_URGENCY' | 'NEUTRAL';
  value?: any;
}

export interface PriorityDecision {
  task_id: number;
  priority_score: number;
  confidence: number;
  top_features: TopFeature[];
  explanation_text: string;
  model_version: string;
}

export interface OptimizedBlock {
  block_id: string;
  package_id?: string;
  task_id?: number;
  task_ids: number[];
  section: string;
  department: string;
  block_type: BlockType;
  scheduled_start: string;
  scheduled_end: string;
  duration_minutes: number;
  priority_score: number;
  confidence: number;
  conflict_score: number;
  downtime_saved_minutes: number;
  reason: string;
  is_emergency?: boolean;
  status?: string;
  before_photo_url?: string;
  before_photo_desc?: string;
  after_photo_url?: string;
  after_photo_desc?: string;
  user_id?: string;
  submitter_name?: string;
  is_fused?: boolean;
}

export interface OptimizedPlan {
  plan_id: string;
  plan_type: PlanType;
  section?: string;
  horizon_days: number;
  blocks: OptimizedBlock[];
  total_tasks: number;
  scheduled_tasks: number;
  unscheduled_tasks: number;
  total_downtime_minutes: number;
  fusion_count: number;
  fusion_benefit_minutes: number;
  solve_status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE';
  solve_time_ms: number;
  objective_breakdown?: Record<string, any>;
  violations?: string[];
}

export interface ConflictDetail {
  conflict_type: string;
  severity: 'HARD' | 'SOFT' | 'RESOLVED';
  block_a_id: string;
  block_b_id?: string;
  description: string;
  auto_resolved: boolean;
  resolution_action?: string;
}

export interface ConflictReport {
  is_valid: boolean;
  hard_violations_count: number;
  soft_warnings_count: number;
  auto_resolved_count: number;
  conflicts: ConflictDetail[];
}

export interface SafetyCertificate {
  is_certified_safe: boolean;
  premium_train_violations: number;
  single_line_concurrency_violations: number;
  corridor_capacity_violations: number;
  verified_at: string;
  total_blocks_audited: number;
  certificate_id: string;
}

export interface PlanExplanation {
  executive_summary: string;
  total_blocks: number;
  total_tasks: number;
  downtime_saved_minutes: number;
  fusion_efficiency_pct: number;
  ai_confidence_score: number;
  dominant_departments: string[];
  safety_assurance: string;
}

export interface FullPlanResult {
  plan_id: string;
  plan_type: PlanType;
  section?: string;
  optimized_plan: OptimizedPlan;
  conflict_report: ConflictReport;
  work_packages_count: number;
  db_records_created: number;
  total_duration_ms: number;
  safety_certificate?: SafetyCertificate;
  plan_explanation?: PlanExplanation;
}

export interface EmergencyReoptResponse {
  emergency_task_id: number;
  reoptimized_plan: OptimizedPlan;
  emergency_block: OptimizedBlock;
  solve_time_ms: number;
  premium_trains_protected: boolean;
  delta_summary: Record<string, any>;
}

export interface ParetoResponse {
  plans: Record<string, OptimizedPlan>;
  comparison_metrics: Record<string, any>;
}

export interface WhatIfResponse {
  is_feasible: boolean;
  block_id: string;
  shift_minutes: number;
  original_start: string;
  simulated_start: string;
  simulated_end: string;
  trains_affected: Array<{
    train_number: string;
    train_name: string;
    headway_buffer_minutes: number;
    is_premium: boolean;
  }>;
  downtime_delta_minutes: number;
  conflicts_introduced: number;
  guardian_advisory: string;
}

export interface WebSocketEvent {
  event?: string;
  event_type?: string;
  timestamp: string;
  data?: any;
  message?: string;
}

export interface CorridorStation {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Corridor {
  section_code: string;
  section_name: string;
  total_km: number;
  daily_trains: number;
  goods_forecast: number;
  block_window_start: string;
  block_window_end: string;
  max_concurrent_blocks: number;
  is_double_line: boolean;
  from_station: CorridorStation;
  to_station: CorridorStation;
  status: 'CLEAR' | 'POSSESSION_ACTIVE' | 'EMERGENCY_BLOCKED' | 'CONGESTED';
  health_score: number;
  zone?: string;
  track_path?: Array<[number, number]>;
}

export type UserRole = 'Section Controller' | 'Chief Controller' | 'DRM' | 'GM';

export interface UserSession {
  id: number;
  name: string;
  role: UserRole;
  division: string;
  zone: string;
}
