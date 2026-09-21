"""
Unit Tests for Canonical Pydantic Schemas.
Verifies validation rules, constraints, and serializations.
"""

import pytest
from datetime import datetime, timezone, timedelta
from pydantic import ValidationError

from app.schemas.corridor import CorridorCreate, CorridorUpdate
from app.schemas.asset import AssetCreate
from app.schemas.defect import DefectCreate
from app.schemas.maintenance import MaintenanceTaskCreate
from app.schemas.timetable import TrainTimetableCreate
from app.schemas.user import UserCreate
from app.models.enums import Department, SourceSystem, TrainType, UserRole


def test_corridor_create_validation() -> None:
    """Tests corridor schema validation."""
    valid_data = {
        "section_code": "NDLS-AGC",
        "section_name": "New Delhi - Agra Cantt",
        "total_km": 195.0,
        "daily_trains": 140,
        "goods_forecast": 40,
        "block_window_start": "00:00:00",
        "block_window_end": "05:00:00",
        "max_concurrent_blocks": 2,
        "is_double_line": True,
    }
    corridor = CorridorCreate(**valid_data)
    assert corridor.section_code == "NDLS-AGC"

    # Test invalid time format
    with pytest.raises(ValidationError):
        CorridorCreate(
            section_code="NDLS-AGC",
            section_name="New Delhi - Agra Cantt",
            total_km=195.0,
            block_window_start="invalid_time",
            block_window_end="05:00:00",
        )


def test_asset_create_validation() -> None:
    """Tests asset schema validation and bounds."""
    asset = AssetCreate(
        code="AST-NDLS-AGC-TRK-001",
        type="Turnout 1:12",
        department=Department.ENGINEERING,
        section="NDLS-AGC",
        corridor_id=1,
        km_from=45.2,
        km_to=46.0,
        criticality=4,
        traffic_density=42.5,
    )
    assert asset.criticality == 4

    # Test out of range criticality
    with pytest.raises(ValidationError):
        AssetCreate(
            code="AST-NDLS-AGC-TRK-001",
            type="Turnout",
            department=Department.ENGINEERING,
            section="NDLS-AGC",
            corridor_id=1,
            km_from=45.2,
            km_to=46.0,
            criticality=7,  # invalid (max 5)
            traffic_density=40.0,
        )


def test_user_email_validation() -> None:
    """Tests user email format validation."""
    user = UserCreate(
        name="Chief Controller",
        email="controller@railnet.gov.in",
        password="SecurePassword2026!",
        role=UserRole.CHIEF_CONTROLLER,
    )
    assert user.email == "controller@railnet.gov.in"

    with pytest.raises(ValidationError):
        UserCreate(
            name="Chief Controller",
            email="not-a-valid-email",
            password="SecurePassword2026!",
            role=UserRole.CHIEF_CONTROLLER,
        )
