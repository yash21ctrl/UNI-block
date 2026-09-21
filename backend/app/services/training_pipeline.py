"""
Training Pipeline for RailBlock AI Priority Urgency Scorer.
Trains an XGBoost Regressor on historical railway maintenance tasks,
evaluates 5-fold cross-validation performance, guarantees R2 >= 0.90,
and serializes model artifacts and metadata.
"""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import time
from typing import Any, Optional

import numpy as np
import pandas as pd
from sklearn.model_selection import KFold, train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sqlalchemy import select
from sqlalchemy.orm import Session
import xgboost as xgb

from app.core.logging import get_logger
from app.database import SessionLocal
from app.models.asset import Asset
from app.models.defect import Defect
from app.models.maintenance import MaintenanceTask
from app.schemas.agent_schemas import TrainingReport

logger = get_logger("railblock.service.training")

MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "priority_xgb_v1.json"
META_PATH = MODEL_DIR / "priority_xgb_v1_meta.json"

FEATURE_NAMES = [
    "severity",
    "log_overdue_days",
    "asset_criticality",
    "traffic_density",
    "safety_impact",
    "estimated_duration_hours",
    "needs_power_block",
    "is_emergency",
    "is_corrective",
    "section_priority_tier",
    "tqi",
    "oms_peak_acceleration_g",
    "cumulative_gmt",
]


def extract_features_from_record(
    task: MaintenanceTask | dict[str, Any],
    defect: Optional[Defect | dict[str, Any]] = None,
    asset: Optional[Asset | dict[str, Any]] = None,
) -> dict[str, float]:
    """
    Constructs normalized numerical feature vector from domain entities.
    """
    def get_val(obj: Any, attr: str, default: float) -> float:
        if obj is None:
            return float(default)
        if isinstance(obj, dict):
            val = obj.get(attr)
        else:
            val = getattr(obj, attr, None)
        if val is None:
            return float(default)
        try:
            return float(val)
        except (ValueError, TypeError):
            return float(default)

    # 1. Defect Severity (1-5)
    if defect:
        severity = get_val(defect, "severity", 3.0)
        overdue_days = get_val(defect, "overdue_days", 0.0)
    else:
        severity = get_val(task, "severity", 3.0)
        overdue_days = get_val(task, "overdue_days", 0.0)

    # 2. Log-transformed overdue days
    log_overdue_days = float(np.log1p(max(0.0, overdue_days)))

    # 3. Asset Criticality (1-5 or 1-10 scaled)
    if asset:
        criticality = get_val(asset, "criticality", 3.0)
        density = get_val(asset, "traffic_density", 35.0)
    else:
        criticality = get_val(task, "criticality", 3.0)
        density = get_val(task, "traffic_density", 35.0)

    # 4. Duration in hours
    duration_mins = get_val(task, "duration_minutes", 180.0)
    duration_hours = max(0.5, duration_mins / 60.0)

    # 5. Operational Requirements & Emergencies
    needs_pow_raw = task.get("needs_power_block") if isinstance(task, dict) else getattr(task, "needs_power_block", False)
    needs_pow = 1.0 if needs_pow_raw else 0.0

    is_emergency = 1.0 if (severity >= 5 or (severity >= 4 and overdue_days >= 3)) else 0.0
    defect_id = task.get("defect_id") if isinstance(task, dict) else getattr(task, "defect_id", None)
    is_corrective = 1.0 if defect_id is not None else 0.0

    # 6. Safety Impact (derived composite)
    safety_impact = (severity * criticality) * (1.35 if is_emergency else 1.0)

    # 7. Section Priority Tier (Tier 1 > 45 GMT, Tier 2 35-45 GMT, Tier 3 < 35 GMT)
    if density >= 45.0:
        tier = 1.0
    elif density >= 35.0:
        tier = 2.0
    else:
        tier = 3.0

    # 8. Physics-Informed RDSO Track Indicators
    tqi_val = get_val(defect, "tqi", 0.0) or get_val(task, "tqi", 0.0) or get_val(asset, "tqi", 0.0)
    if tqi_val <= 0.0:
        tqi_val = round(20.0 + (density / 60.0) * 10.0 + min(12.0, overdue_days * 1.5) + (severity * 1.5), 1)

    oms_val = get_val(defect, "oms_peak_acceleration_g", 0.0) or get_val(task, "oms_peak_acceleration_g", 0.0)
    if oms_val <= 0.0:
        oms_val = round(0.08 + (severity / 5.0) * 0.16 + (criticality / 5.0) * 0.04, 3)

    gmt_val = get_val(asset, "cumulative_gmt", 0.0) or get_val(task, "cumulative_gmt", 0.0)
    if gmt_val <= 0.0:
        gmt_val = round(density * (1.0 + (overdue_days / 60.0)), 1)

    return {
        "severity": severity,
        "log_overdue_days": log_overdue_days,
        "asset_criticality": criticality,
        "traffic_density": density,
        "safety_impact": safety_impact,
        "estimated_duration_hours": duration_hours,
        "needs_power_block": needs_pow,
        "is_emergency": is_emergency,
        "is_corrective": is_corrective,
        "section_priority_tier": tier,
        "tqi": tqi_val,
        "oms_peak_acceleration_g": oms_val,
        "cumulative_gmt": gmt_val,
    }


def load_dataset_from_db(limit: int = 5000) -> tuple[pd.DataFrame, pd.Series]:
    """
    Extracts maintenance records and feature matrix from database.
    """
    db: Session = SessionLocal()
    try:
        query = (
            select(MaintenanceTask, Defect, Asset)
            .outerjoin(Defect, MaintenanceTask.defect_id == Defect.id)
            .join(Asset, MaintenanceTask.asset_id == Asset.id)
            .limit(limit)
        )
        rows = db.execute(query).all()

        if not rows or len(rows) < 50:
            logger.warning("Insufficient tasks in database. Running synthetic fallback generator.")
            from app.utils.synthetic_data import (
                generate_corridors,
                generate_assets,
                generate_defects_and_tasks,
                CORRIDOR_CATALOG,
            )
            c_map = {c["section_code"]: i + 1 for i, c in enumerate(CORRIDOR_CATALOG)}
            raw_assets = generate_assets(c_map, target_count=500)
            a_map = {a["code"]: i + 1 for i, a in enumerate(raw_assets)}
            raw_defects, raw_tasks = generate_defects_and_tasks(raw_assets, a_map, total_records=limit)

            feature_records = []
            targets = []
            for t in raw_tasks:
                d = raw_defects[t["defect_index"]] if t.get("defect_index") is not None else None
                a = next((x for x in raw_assets if a_map[x["code"]] == t["asset_id"]), None)
                feat = extract_features_from_record(t, d, a)
                feature_records.append(feat)
                targets.append(t["priority_score"])

            return pd.DataFrame(feature_records), pd.Series(targets)

        feature_records = []
        targets = []
        for task, defect, asset in rows:
            feat = extract_features_from_record(task, defect, asset)
            feature_records.append(feat)
            targets.append(float(task.priority_score))

        return pd.DataFrame(feature_records), pd.Series(targets)
    finally:
        db.close()


def train_priority_model(limit: int = 5000) -> TrainingReport:
    """
    Executes end-to-end model training, 5-fold CV evaluation, and artifact serialization.
    Enforces quality gate: R2 >= 0.90.
    """
    logger.info("Initiating Priority Agent XGBoost training pipeline...", sample_limit=limit)
    start_time = time.perf_counter()

    X, y = load_dataset_from_db(limit=limit)
    logger.info("Feature dataset constructed", features=list(X.columns), shape=X.shape)

    # 80/20 Train / Holdout Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=2026
    )

    # 5-fold Cross Validation on Training Set
    kf = KFold(n_splits=5, shuffle=True, random_state=2026)
    cv_scores: list[float] = []

    for fold, (train_idx, val_idx) in enumerate(kf.split(X_train)):
        fold_X_tr, fold_y_tr = X_train.iloc[train_idx], y_train.iloc[train_idx]
        fold_X_val, fold_y_val = X_train.iloc[val_idx], y_train.iloc[val_idx]

        fold_model = xgb.XGBRegressor(
            n_estimators=160,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=2026 + fold,
            n_jobs=-1,
        )
        fold_model.fit(fold_X_tr, fold_y_tr)
        pred_val = fold_model.predict(fold_X_val)
        score_val = r2_score(fold_y_val, pred_val)
        cv_scores.append(round(float(score_val), 4))

    mean_cv_r2 = round(float(np.mean(cv_scores)), 4)
    logger.info("5-Fold Cross Validation Complete", fold_r2_scores=cv_scores, mean_cv_r2=mean_cv_r2)

    # Train final model on full training set
    final_model = xgb.XGBRegressor(
        n_estimators=180,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=2026,
        n_jobs=-1,
    )
    final_model.fit(X_train, y_train)

    # Evaluate Holdout Test Set
    holdout_preds = final_model.predict(X_test)
    r2 = round(float(r2_score(y_test, holdout_preds)), 4)
    mae = round(float(mean_absolute_error(y_test, holdout_preds)), 3)
    rmse = round(float(np.sqrt(mean_squared_error(y_test, holdout_preds))), 3)

    logger.info(
        "Holdout Evaluation Results",
        r2_score=r2,
        mae=mae,
        rmse=rmse,
        target_met=(r2 >= 0.90),
    )

    if r2 < 0.90:
        raise ValueError(
            f"Quality Gate Failed: Priority model R2 {r2:.4f} is below mandatory 0.90 requirement."
        )

    # Rank top features by importance
    importances = final_model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    top_feature_list = [FEATURE_NAMES[i] for i in sorted_idx]

    # Serialize Model Artifact
    final_model.save_model(str(MODEL_PATH))

    meta_payload = {
        "model_version": "priority_xgb_v1.0",
        "algorithm": "XGBoostRegressor",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "r2_score": r2,
        "mae": mae,
        "rmse": rmse,
        "cv_mean_r2": mean_cv_r2,
        "cv_scores": cv_scores,
        "features": FEATURE_NAMES,
        "top_features": top_feature_list,
        "hyperparameters": {
            "n_estimators": 180,
            "max_depth": 5,
            "learning_rate": 0.08,
        },
    }

    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(meta_payload, f, indent=2)

    elapsed = round(time.perf_counter() - start_time, 2)
    logger.info(
        "Priority model training successfully finished and persisted",
        model_path=str(MODEL_PATH),
        elapsed_seconds=elapsed,
    )

    return TrainingReport(
        model_version="priority_xgb_v1.0",
        r2_score=r2,
        mae=mae,
        rmse=rmse,
        cv_scores=cv_scores,
        cv_mean_r2=mean_cv_r2,
        training_samples=len(X_train),
        test_samples=len(X_test),
        top_features=top_feature_list,
        model_path=str(MODEL_PATH),
        metadata_path=str(META_PATH),
        timestamp=datetime.now(timezone.utc),
    )


if __name__ == "__main__":
    report = train_priority_model(limit=5000)
    print("\n" + "=" * 60)
    print(" PRIORITY AGENT MODEL TRAINING REPORT ")
    print("=" * 60)
    print(f" * Model Version:   {report.model_version}")
    print(f" * Holdout R2:       {report.r2_score:.4f} (Mandatory >= 0.90)")
    print(f" * Holdout MAE:      {report.mae:.3f} points")
    print(f" * Holdout RMSE:     {report.rmse:.3f} points")
    print(f" * 5-Fold Mean R2:   {report.cv_mean_r2:.4f}")
    print(f" * Top Features:     {', '.join(report.top_features[:4])}")
    print(f" * Model Artifact:   {report.model_path}")
    print("=" * 60 + "\n")
