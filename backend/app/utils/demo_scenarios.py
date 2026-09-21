"""
Demo Scenarios for RailBlock AI (Phase 3 Core Brain).
Provides structured benchmark test cases for:
- Scenario A: Normal weekly plan (50 tasks, ~30% block reduction via fusion, solve <2s)
- Scenario B: Heavy load (240 tasks with section decomposition, cumulative <10s)
- Scenario C: Fusion showcase (Engg + S&T + TRD on NDLS-AGC, 50% downtime saved)
- Scenario D: Emergency injection (Priority 99 rail fracture, <5s SLA)
"""

from datetime import datetime, timezone
import random
from typing import Any

from app.models.enums import Department, TaskType, BlockType


def get_scenario_a_tasks() -> list[dict[str, Any]]:
    """
    Scenario A: Normal weekly load.
    50 maintenance tasks distributed across 3 key high-density sections:
    - NDLS-AGC (New Delhi - Agra Cantt)
    - AGC-JHS (Agra Cantt - Jhansi)
    - NDLS-GZB (New Delhi - Ghaziabad)

    Designed with deliberate spatial and temporal affinities to allow
    Fusion Agent to combine 25-35% of tasks into joint work packages.
    """
    tasks: list[dict[str, Any]] = []
    task_id = 1000

    sections_config = [
        {"code": "NDLS-AGC", "count": 22, "km_clusters": [(45.0, 55.0), (110.0, 120.0), (160.0, 175.0)]},
        {"code": "AGC-JHS", "count": 18, "km_clusters": [(30.0, 42.0), (85.0, 95.0)]},
        {"code": "NDLS-GZB", "count": 10, "km_clusters": [(5.0, 15.0)]},
    ]

    for sec in sections_config:
        sec_code = sec["code"]
        clusters = sec["km_clusters"]

        for i in range(sec["count"]):
            task_id += 1
            # Assign km within a cluster so some tasks co-locate
            c_km_min, c_km_max = clusters[i % len(clusters)]
            km_from = round(c_km_min + (i % 3) * 2.5, 1)
            km_to = round(km_from + 2.0, 1)

            dept_choice = [Department.ENGINEERING, Department.SIGNAL_TELECOM, Department.TRACTION_DISTRIBUTION][i % 3]
            needs_power = (dept_choice == Department.TRACTION_DISTRIBUTION) or (i % 4 == 0)
            duration = 120 + (i % 4) * 30  # 120, 150, 180, 210

            tasks.append({
                "id": task_id,
                "section": sec_code,
                "department": dept_choice.value,
                "task_type": "Track Maintenance" if dept_choice == Department.ENGINEERING else (
                    "Signal Overhaul" if dept_choice == Department.SIGNAL_TELECOM else "OHE Periodic Inspection"
                ),
                "priority_score": round(60.0 + (i * 1.5) % 35, 1),
                "duration_minutes": duration,
                "needs_power_block": needs_power,
                "needs_traffic_block": True,
                "can_combine": True,
                "resources_json": {
                    "crew_size": 8,
                    "machinery": [f"TampingMachine_{sec_code}"] if i % 2 == 0 else [],
                },
                "km_from": km_from,
                "km_to": km_to,
            })

    return tasks


def get_scenario_b_tasks(target_count: int = 240) -> list[dict[str, Any]]:
    """
    Scenario B: Heavy operational load.
    200-300 maintenance tasks distributed across 6 Indian Railways sections.
    Demonstrates section-by-section decomposed solving within the cumulative <10s target.
    """
    tasks: list[dict[str, Any]] = []
    sections = ["NDLS-AGC", "AGC-JHS", "JHS-BPL", "NDLS-GZB", "GZB-ALJN", "ALJN-CNB"]
    tasks_per_section = target_count // len(sections)
    task_id = 2000

    for sec in sections:
        for i in range(tasks_per_section):
            task_id += 1
            dept = [Department.ENGINEERING, Department.SIGNAL_TELECOM, Department.TRACTION_DISTRIBUTION][i % 3]
            km_start = 10.0 + (i % 10) * 15.0
            tasks.append({
                "id": task_id,
                "section": sec,
                "department": dept.value,
                "task_type": f"Heavy_{dept.value}_Routine_{i % 5}",
                "priority_score": round(50.0 + (i * 2.1) % 45, 1),
                "duration_minutes": 120 + (i % 3) * 30,
                "needs_power_block": (dept == Department.TRACTION_DISTRIBUTION),
                "needs_traffic_block": True,
                "can_combine": (i % 5 != 0),  # 80% combinable
                "resources_json": {"crew_size": 6},
                "km_from": km_start,
                "km_to": km_start + 3.0,
            })

    return tasks


def get_scenario_c_tasks() -> list[dict[str, Any]]:
    """
    Scenario C: Multi-Department Fusion Showcase.
    Exactly 3 complementary tasks on the same section (NDLS-AGC) and same km range (km 45.0 - 52.0):
    1. Civil Engg: Rail renewal (180 mins)
    2. S&T: Track circuit replacement (150 mins)
    3. TRD: OHE catenary bracket inspection (150 mins)

    Individually: 180 + 150 + 150 = 480 mins separate downtime.
    Fused into 1 Integrated Block: max(180, 150, 150) + 30 (cross-dept) + 30 (TRD power safety buffer) = 240 mins.
    Downtime saved: 480 - 240 = 240 mins (50.0% reduction).
    """
    return [
        {
            "id": 3001,
            "section": "NDLS-AGC",
            "department": Department.ENGINEERING.value,
            "task_type": "Rail Renewal & Ballast Tamping",
            "priority_score": 88.5,
            "duration_minutes": 180,
            "needs_power_block": False,
            "needs_traffic_block": True,
            "can_combine": True,
            "resources_json": {"machinery": ["BCM_01"], "crew_size": 12},
            "km_from": 45.0,
            "km_to": 52.0,
        },
        {
            "id": 3002,
            "section": "NDLS-AGC",
            "department": Department.SIGNAL_TELECOM.value,
            "task_type": "Audio Frequency Track Circuit (AFTC) Renewal",
            "priority_score": 82.0,
            "duration_minutes": 150,
            "needs_power_block": False,
            "needs_traffic_block": True,
            "can_combine": True,
            "resources_json": {"machinery": ["WiringTrolley_03"], "crew_size": 6},
            "km_from": 46.5,
            "km_to": 50.0,
        },
        {
            "id": 3003,
            "section": "NDLS-AGC",
            "department": Department.TRACTION_DISTRIBUTION.value,
            "task_type": "OHE Catenary & Dropper Inspection",
            "priority_score": 85.0,
            "duration_minutes": 150,
            "needs_power_block": True,
            "needs_traffic_block": True,
            "can_combine": True,
            "resources_json": {"machinery": ["TowerWagon_09"], "crew_size": 8},
            "km_from": 45.0,
            "km_to": 52.0,
        },
    ]


def get_scenario_d_data() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """
    Scenario D: Emergency Injection.
    Returns:
    - Base plan tasks already active on NDLS-AGC (12 tasks)
    - Emergency task: Critical rail fracture detected at 23:00 on NDLS-AGC km 88.4
      (Priority 99.5, severity 5, duration 120 mins).
    """
    base_tasks: list[dict[str, Any]] = [
        {
            "id": 4000 + i,
            "section": "NDLS-AGC",
            "department": Department.ENGINEERING.value if i % 2 == 0 else Department.SIGNAL_TELECOM.value,
            "task_type": f"Scheduled_Routine_Maintenance_{i}",
            "priority_score": round(65.0 + i * 2.0, 1),
            "duration_minutes": 120,
            "needs_power_block": False,
            "needs_traffic_block": True,
            "can_combine": True,
            "resources_json": {"crew_size": 6},
            "km_from": 20.0 + i * 12.0,
            "km_to": 22.0 + i * 12.0,
        }
        for i in range(12)
    ]

    emergency_defect_task: dict[str, Any] = {
        "id": 9999,
        "section": "NDLS-AGC",
        "department": Department.ENGINEERING.value,
        "task_type": "EMERGENCY: Complete Rail Fracture (Ultrasonic Detected)",
        "priority_score": 99.5,
        "severity": 5,
        "duration_minutes": 120,
        "needs_power_block": False,
        "needs_traffic_block": True,
        "can_combine": False,
        "resources_json": {"machinery": ["FlashButtWelder_01"], "crew_size": 16},
        "km_from": 88.4,
        "km_to": 88.6,
        "is_emergency": 1,
    }

    return base_tasks, emergency_defect_task
