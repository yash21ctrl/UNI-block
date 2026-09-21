"""
Priority Agent for RailBlock AI.
Scores railway maintenance tasks on an urgency scale (0-100) using XGBoost
and synthesizes local SHAP feature attributions into plain English operational explanations.
"""

from pathlib import Path
import time
from typing import Any, Optional

import numpy as np
import pandas as pd
import shap
import xgboost as xgb

from app.core.logging import get_logger
from app.models.maintenance import MaintenanceTask
from app.schemas.agent_schemas import (
    PriorityDecision,
    TopFeature,
    TrainingReport,
    Explanation,
)
from app.services.training_pipeline import (
    MODEL_PATH,
    META_PATH,
    FEATURE_NAMES,
    extract_features_from_record,
    train_priority_model,
)

logger = get_logger("railblock.agent.priority")


class PriorityAgent:
    """
    Intelligent Priority Agent utilizing XGBoost regression + TreeSHAP explainability
    to assign objective, explainable urgency scores (0-100) to maintenance tasks.
    """

    def __init__(self, model_path: Optional[str] = None) -> None:
        self.model_path = Path(model_path) if model_path else MODEL_PATH
        self.model: Optional[xgb.XGBRegressor] = None
        self.explainer: Optional[shap.TreeExplainer] = None
        self.model_version = "priority_xgb_v1.0"

        # Load or initialize model
        if self.model_path.exists():
            self.load(str(self.model_path))
        else:
            logger.info("Priority model not found on disk. Initiating first-time training...")
            self.train()

    def train(self, limit: int = 5000) -> TrainingReport:
        """
        Executes model training pipeline, validates R2 >= 0.90, and reloads active model.
        """
        report = train_priority_model(limit=limit)
        self.load(report.model_path)
        return report

    def load(self, path: str) -> None:
        """
        Loads pre-trained XGBoost model artifact and initializes SHAP TreeExplainer.
        """
        target_path = Path(path)
        if not target_path.exists():
            raise FileNotFoundError(f"Model file not found at {path}")

        logger.info("Loading Priority Agent XGBoost model...", path=str(target_path))
        self.model = xgb.XGBRegressor()
        self.model.load_model(str(target_path))
        self.model_path = target_path

        # Initialize TreeExplainer for fast SHAP attribution computation
        self.explainer = shap.TreeExplainer(self.model)
        logger.info("Priority Agent TreeExplainer initialized successfully.")

    def _build_natural_explanation(
        self, score: float, top_features: list[TopFeature], task_dict: dict[str, Any]
    ) -> str:
        """
        Synthesizes human-readable operational justification from top SHAP contributors.
        """
        primary_reasons = []
        for feat in top_features[:3]:
            fname = feat.feature.replace("_", " ")
            val = feat.value
            shap_val = feat.shap_value
            sign = "+" if shap_val >= 0 else ""
            if fname == "severity":
                primary_reasons.append(f"severity level {val} ({sign}{shap_val:.1f} pts)")
            elif fname in ("log overdue days", "overdue days"):
                primary_reasons.append(f"overdue schedule delay ({sign}{shap_val:.1f} pts)")
            elif fname == "safety impact":
                primary_reasons.append(f"high safety risk multiplier ({sign}{shap_val:.1f} pts)")
            elif fname == "traffic density":
                primary_reasons.append(f"corridor traffic GMT {val} ({sign}{shap_val:.1f} pts)")
            elif fname == "oms peak acceleration g":
                primary_reasons.append(f"OMS track jerk {val:.2f}g ({sign}{shap_val:.1f} pts)")
            elif fname == "tqi":
                primary_reasons.append(f"Track Quality Index {val:.1f} ({sign}{shap_val:.1f} pts)")
            elif fname == "cumulative gmt":
                primary_reasons.append(f"cumulative tonnage {val:.1f} GMT ({sign}{shap_val:.1f} pts)")
            elif fname == "is emergency":
                primary_reasons.append(f"emergency track status ({sign}{shap_val:.1f} pts)")
            else:
                primary_reasons.append(f"{fname} ({sign}{shap_val:.1f} pts)")

        reasons_str = ", ".join(primary_reasons)

        if score >= 80.0:
            return (
                f"Urgent priority ({score:.1f}/100) assigned primarily due to {reasons_str}. "
                f"Requires prompt slot allocation in upcoming block window."
            )
        elif score >= 60.0:
            return (
                f"Elevated priority ({score:.1f}/100) driven by {reasons_str}. "
                f"Recommended for integration in next maintenance possession."
            )
        else:
            return (
                f"Standard routine maintenance score ({score:.1f}/100) influenced by {reasons_str}. "
                f"Eligible for shadow block clustering during primary possessions."
            )

    def score(
        self,
        task: MaintenanceTask | dict[str, Any],
        defect: Optional[Any] = None,
        asset: Optional[Any] = None,
    ) -> PriorityDecision:
        """
        Scores a single maintenance task in < 50ms and computes SHAP feature attributions.
        """
        if self.model is None or self.explainer is None:
            raise RuntimeError("PriorityAgent model is not loaded. Call load() or train() first.")

        t_start = time.perf_counter()

        feat_dict = extract_features_from_record(task, defect, asset)
        df_feat = pd.DataFrame([feat_dict], columns=FEATURE_NAMES)

        # Predict Priority Urgency (0-100)
        raw_score = float(self.model.predict(df_feat)[0])
        score = max(0.0, min(100.0, round(raw_score, 1)))

        # Compute TreeSHAP Values
        shap_values = self.explainer.shap_values(df_feat)
        if isinstance(shap_values, list):
            shap_row = shap_values[0][0]
        elif len(shap_values.shape) > 1:
            shap_row = shap_values[0]
        else:
            shap_row = shap_values

        # Rank features by absolute impact
        ranked_indices = np.argsort(np.abs(shap_row))[::-1]

        top_features: list[TopFeature] = []
        for idx in ranked_indices:
            s_val = float(shap_row[idx])
            f_name = FEATURE_NAMES[idx]
            dir_str = "INCREASES_URGENCY" if s_val > 0.05 else ("DECREASES_URGENCY" if s_val < -0.05 else "NEUTRAL")
            top_features.append(
                TopFeature(
                    feature=f_name,
                    shap_value=round(s_val, 2),
                    direction=dir_str,
                    value=feat_dict.get(f_name),
                )
            )

        explanation = self._build_natural_explanation(score, top_features, feat_dict)
        confidence = round(0.92 + min(0.06, abs(score - 50.0) / 500.0), 2)

        task_id = getattr(task, "id", None) or (task.get("id") if isinstance(task, dict) else 1) or 1
        elapsed_ms = round((time.perf_counter() - t_start) * 1000, 2)

        logger.debug("Task scored", task_id=task_id, score=score, latency_ms=elapsed_ms)

        # Calculate dynamic propagation window / time-to-failure
        sev = float(feat_dict.get("severity", 3.0))
        oms_acc = float(feat_dict.get("oms_peak_acceleration_g", 0.12))
        if sev >= 5.0 or oms_acc >= 0.25:
            prop_hours = max(4, int(24 / (1.0 + max(0.0, oms_acc - 0.15) * 5.0)))
        elif sev >= 4.0 or oms_acc >= 0.18:
            prop_hours = max(18, int(72 / (1.0 + max(0.0, oms_acc - 0.15) * 3.0)))
        elif sev >= 3.0:
            prop_hours = max(48, int(192 / (1.0 + max(0.0, oms_acc - 0.12) * 2.0)))
        else:
            prop_hours = 720

        return PriorityDecision(
            task_id=task_id,
            priority_score=score,
            confidence=confidence,
            top_features=top_features[:5],
            explanation_text=explanation,
            model_version=self.model_version,
            tqi=feat_dict.get("tqi"),
            oms_peak_acceleration_g=feat_dict.get("oms_peak_acceleration_g"),
            cumulative_gmt=feat_dict.get("cumulative_gmt"),
            estimated_propagation_hours=prop_hours,
        )

    def score_batch(self, tasks: list[Any]) -> list[PriorityDecision]:
        """
        Scores multiple tasks in batch for maximum throughput.
        """
        decisions: list[PriorityDecision] = []
        for t in tasks:
            d = self.score(t)
            decisions.append(d)
        return decisions

    def explain(self, task: MaintenanceTask | dict[str, Any]) -> Explanation:
        """
        Returns comprehensive explainability report with full SHAP breakdown and risk categorization.
        """
        decision = self.score(task)

        if decision.priority_score >= 80.0:
            risk_tier = "CRITICAL"
        elif decision.priority_score >= 65.0:
            risk_tier = "HIGH"
        elif decision.priority_score >= 45.0:
            risk_tier = "MEDIUM"
        else:
            risk_tier = "ROUTINE"

        return Explanation(
            task_id=decision.task_id,
            priority_score=decision.priority_score,
            natural_language_explanation=decision.explanation_text,
            shap_contributions=decision.top_features,
            risk_tier=risk_tier,
            tqi=decision.tqi,
            oms_peak_acceleration_g=decision.oms_peak_acceleration_g,
            cumulative_gmt=decision.cumulative_gmt,
            estimated_propagation_hours=decision.estimated_propagation_hours,
        )
