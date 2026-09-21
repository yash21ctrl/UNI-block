"""
Unit Tests for Fusion Agent (Phase 3 Core Brain).
Tests:
- can_combine compatibility rules (section, distance, machinery, isolation)
- compute_fusion_benefit calculation
- NetworkX graph construction
- Multi-department clustering and WorkPackage output
"""

import pytest
from app.agents.fusion_agent import FusionAgent
from app.models.enums import Department, BlockType
from app.schemas.agent_schemas import WorkPackage


@pytest.fixture
def fusion_agent() -> FusionAgent:
    return FusionAgent(max_window_minutes=300)


@pytest.fixture
def sample_compatible_tasks() -> list[dict]:
    return [
        {
            "id": 101,
            "section": "NDLS-AGC",
            "department": Department.ENGINEERING.value,
            "task_type": "Track Tamping",
            "priority_score": 85.0,
            "duration_minutes": 180,
            "needs_power_block": False,
            "needs_traffic_block": True,
            "can_combine": True,
            "resources_json": {"machinery": ["TampingMachine_01"], "crew_size": 8},
            "km_from": 45.0,
            "km_to": 48.0,
        },
        {
            "id": 102,
            "section": "NDLS-AGC",
            "department": Department.SIGNAL_TELECOM.value,
            "task_type": "Signal Overhaul",
            "priority_score": 78.0,
            "duration_minutes": 120,
            "needs_power_block": False,
            "needs_traffic_block": True,
            "can_combine": True,
            "resources_json": {"machinery": ["TestingKit_02"], "crew_size": 4},
            "km_from": 46.0,
            "km_to": 47.5,
        },
        {
            "id": 103,
            "section": "NDLS-AGC",
            "department": Department.TRACTION_DISTRIBUTION.value,
            "task_type": "OHE Catenary Inspection",
            "priority_score": 80.0,
            "duration_minutes": 150,
            "needs_power_block": True,
            "needs_traffic_block": True,
            "can_combine": True,
            "resources_json": {"machinery": ["TowerWagon_01"], "crew_size": 6},
            "km_from": 45.5,
            "km_to": 49.0,
        },
    ]


def test_can_combine_compatible_pair(fusion_agent: FusionAgent, sample_compatible_tasks: list[dict]):
    t1 = sample_compatible_tasks[0]
    t2 = sample_compatible_tasks[1]
    can_combine, reason = fusion_agent.can_combine(t1, t2)
    assert can_combine is True
    assert "Compatible" in reason


def test_can_combine_incompatible_sections(fusion_agent: FusionAgent, sample_compatible_tasks: list[dict]):
    t1 = sample_compatible_tasks[0]
    t2 = dict(sample_compatible_tasks[1])
    t2["section"] = "AGC-JHS"
    can_combine, reason = fusion_agent.can_combine(t1, t2)
    assert can_combine is False
    assert "Incompatible corridor sections" in reason


def test_can_combine_excessive_distance(fusion_agent: FusionAgent, sample_compatible_tasks: list[dict]):
    t1 = sample_compatible_tasks[0]
    t2 = dict(sample_compatible_tasks[1])
    t2["km_from"] = 120.0
    t2["km_to"] = 125.0
    can_combine, reason = fusion_agent.can_combine(t1, t2)
    assert can_combine is False
    assert "Physical distance" in reason


def test_can_combine_machinery_conflict(fusion_agent: FusionAgent, sample_compatible_tasks: list[dict]):
    t1 = sample_compatible_tasks[0]
    t2 = dict(sample_compatible_tasks[1])
    t2["resources_json"] = {"machinery": ["TampingMachine_01"]}
    can_combine, reason = fusion_agent.can_combine(t1, t2)
    assert can_combine is False
    assert "Machinery conflict" in reason


def test_can_combine_non_combinable_flag(fusion_agent: FusionAgent, sample_compatible_tasks: list[dict]):
    t1 = dict(sample_compatible_tasks[0])
    t1["can_combine"] = False
    t2 = sample_compatible_tasks[1]
    can_combine, reason = fusion_agent.can_combine(t1, t2)
    assert can_combine is False
    assert "isolated possession" in reason


def test_compute_fusion_benefit(fusion_agent: FusionAgent, sample_compatible_tasks: list[dict]):
    benefit = fusion_agent.compute_fusion_benefit(sample_compatible_tasks)
    # Individual sum: 180 + 120 + 150 = 450
    # Package: max(180, 120, 150) + 20 + 20 (cross-dept) + 30 (power) = 250
    # Expected benefit: 450 - 250 = 200
    assert benefit > 0.0
    assert benefit >= 150.0


def test_to_graph_structure(fusion_agent: FusionAgent, sample_compatible_tasks: list[dict]):
    graph = fusion_agent.to_graph(sample_compatible_tasks)
    assert graph.number_of_nodes() == 3
    assert graph.number_of_edges() >= 1


def test_analyze_creates_integrated_work_package(fusion_agent: FusionAgent, sample_compatible_tasks: list[dict]):
    packages = fusion_agent.analyze(sample_compatible_tasks)
    assert len(packages) >= 1
    pkg = packages[0]
    assert isinstance(pkg, WorkPackage)
    assert len(pkg.tasks) >= 2
    assert pkg.fusion_benefit_minutes > 0
    assert pkg.required_block_type == BlockType.INTEGRATED_BLOCK
