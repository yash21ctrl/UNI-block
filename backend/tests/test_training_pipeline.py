"""
Unit Tests for Priority Model Training Pipeline.
Verifies feature engineering integrity, holdout R2 >= 0.90 constraint,
and model metadata serialization.
"""

from pathlib import Path
from app.services.training_pipeline import (
    FEATURE_NAMES,
    extract_features_from_record,
    train_priority_model,
    MODEL_PATH,
    META_PATH,
)


def test_feature_engineering_extraction() -> None:
    """Tests feature extraction and normalization logic."""
    sample_task = {
        "id": 1,
        "duration_minutes": 180,
        "needs_power_block": True,
        "defect_id": 10,
        "severity": 4,
        "overdue_days": 3,
        "criticality": 4,
        "traffic_density": 50.0,
    }

    features = extract_features_from_record(sample_task)

    assert set(features.keys()) == set(FEATURE_NAMES)
    assert features["severity"] == 4.0
    assert features["needs_power_block"] == 1.0
    assert features["is_corrective"] == 1.0
    assert features["estimated_duration_hours"] == 3.0
    assert features["section_priority_tier"] == 1.0  # density >= 45.0


def test_priority_model_training_and_r2_gate() -> None:
    """Verifies that model training achieves R2 >= 0.90 and outputs files."""
    report = train_priority_model(limit=2000)

    assert report.r2_score >= 0.90, f"R2 {report.r2_score} did not meet mandatory 0.90 threshold"
    assert report.mae < 4.0
    assert report.cv_mean_r2 >= 0.90
    assert Path(report.model_path).exists()
    assert Path(report.metadata_path).exists()
