"""
Unit Tests for Synthetic Data Generator.
Verifies Indian Railways domain accuracy, asset counts, task distributions,
and correlation characteristics.
"""

from app.utils.synthetic_data import (
    generate_corridors,
    generate_assets,
    generate_defects_and_tasks,
    generate_train_timetables,
    CORRIDOR_CATALOG,
)
from app.models.enums import Department, TrainType


def test_corridor_catalog_specifications() -> None:
    """Verifies that Karnataka and Indian Railways corridors are present and valid."""
    corridors = generate_corridors()
    assert len(corridors) >= 12

    codes = [c["section_code"] for c in corridors]
    assert "SBC-MYS" in codes
    assert "SBC-UBL" in codes
    assert "NDLS-AGC" in codes
    assert "AGC-JHS" in codes
    assert "JHS-BPL" in codes
    assert "NDLS-GZB" in codes
    assert "BRC-BVI" in codes

    for c in corridors:
        assert c["total_km"] > 0
        assert c["daily_trains"] > 0
        assert c["block_window_start"] == "00:00:00" or c["block_window_start"].startswith("0")
        assert isinstance(c["is_double_line"], bool)


def test_asset_generation_scale_and_departments() -> None:
    """Verifies that 500+ assets are generated across all 3 departments."""
    corridor_map = {c["section_code"]: idx + 1 for idx, c in enumerate(CORRIDOR_CATALOG)}
    assets = generate_assets(corridor_map, target_count=500)

    assert len(assets) >= 500

    departments = {a["department"] for a in assets}
    assert Department.ENGINEERING in departments
    assert Department.SIGNAL_TELECOM in departments
    assert Department.TRACTION_DISTRIBUTION in departments

    for a in assets:
        assert a["code"].startswith("AST-")
        assert a["km_from"] < a["km_to"]
        assert 1 <= a["criticality"] <= 5
        assert 20.0 <= a["traffic_density"] <= 70.0


def test_defects_and_tasks_correlations_and_scale() -> None:
    """Verifies generation of 5,000 historical maintenance records with realistic correlation."""
    corridor_map = {c["section_code"]: idx + 1 for idx, c in enumerate(CORRIDOR_CATALOG)}
    assets = generate_assets(corridor_map, target_count=500)
    asset_id_map = {a["code"]: idx + 1 for idx, a in enumerate(assets)}

    # Generate 5,000 maintenance records for ML training
    defects, tasks = generate_defects_and_tasks(assets, asset_id_map, total_records=5000)

    assert len(defects) == 5000
    assert len(tasks) == 5000

    for d in defects:
        assert 1 <= d["severity"] <= 5
        assert d["overdue_days"] >= 0
        assert d["estimated_duration_minutes"] >= 30

    for t in tasks:
        assert 0.0 <= t["priority_score"] <= 100.0
        assert t["duration_minutes"] >= 30
        assert isinstance(t["needs_power_block"], bool)
        assert isinstance(t["needs_traffic_block"], bool)
        assert "machinery" in t["resources_json"]

    # Verify that traction distribution tasks have power block requirement
    trd_tasks = [t for t in tasks if t["department"] == Department.TRACTION_DISTRIBUTION]
    power_block_ratio = sum(1 for t in trd_tasks if t["needs_power_block"]) / len(trd_tasks)
    assert power_block_ratio > 0.65  # Most TRD tasks require OHE power block


def test_train_timetables_generation() -> None:
    """Verifies that 200+ realistic trains are scheduled across the week."""
    corridor_map = {c["section_code"]: idx + 1 for idx, c in enumerate(CORRIDOR_CATALOG)}
    timetables = generate_train_timetables(corridor_map, target_count=200)

    assert len(timetables) >= 200

    train_types = {t["train_type"] for t in timetables}
    assert TrainType.VANDE_BHARAT in train_types
    assert TrainType.RAJDHANI in train_types
    assert TrainType.SHATABDI in train_types
    assert TrainType.GOODS in train_types

    # Ensure departure is before arrival
    for t in timetables:
        assert t["departure_time"] < t["arrival_time"]
        assert 0 <= t["day_of_week"] <= 6
