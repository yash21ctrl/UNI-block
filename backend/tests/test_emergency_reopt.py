"""
Tests for High-Velocity Emergency Re-Optimization (<5s SLA).
Tests:
- Sub-5000ms solver response time
- Immediate slot allocation for injected critical defects (e.g. rail fractures)
- Preservation of pre-approved frozen maintenance blocks
- Premium passenger train headway protection
"""

import pytest
import time
from app.agents.optimizer_agent import OptimizerAgent
from app.schemas.agent_schemas import EmergencyReoptResponse
from app.utils.demo_scenarios import get_scenario_d_data


@pytest.fixture
def optimizer_agent() -> OptimizerAgent:
    return OptimizerAgent()


@pytest.mark.asyncio
async def test_emergency_reoptimization_sla(optimizer_agent: OptimizerAgent):
    base_tasks, emergency_task = get_scenario_d_data()

    # Create baseline plan
    base_plan = await optimizer_agent.optimize_weekly(base_tasks[:8], section_code="NDLS-AGC")
    assert len(base_plan.blocks) > 0

    t_start = time.perf_counter()
    reopt_res = await optimizer_agent.emergency_reoptimize(
        current_plan=base_plan,
        emergency_task=emergency_task,
        freeze_approved=True,
    )
    duration_ms = (time.perf_counter() - t_start) * 1000

    assert isinstance(reopt_res, EmergencyReoptResponse)
    # Strict SLA check: must be < 5000 ms
    assert duration_ms < 5000.0
    assert reopt_res.solve_time_ms < 5000.0

    # Emergency task allocation check
    assert reopt_res.emergency_block is not None
    assert emergency_task["id"] in reopt_res.emergency_block.task_ids
    assert reopt_res.premium_trains_protected is True
    assert reopt_res.delta_summary.get("sla_met_under_5s") is True


@pytest.mark.asyncio
async def test_frozen_blocks_preservation(optimizer_agent: OptimizerAgent):
    base_tasks, emergency_task = get_scenario_d_data()
    base_plan = await optimizer_agent.optimize_weekly(base_tasks[:6], section_code="NDLS-AGC")
    frozen_count = len(base_plan.blocks)

    reopt_res = await optimizer_agent.emergency_reoptimize(
        current_plan=base_plan,
        emergency_task=emergency_task,
        freeze_approved=True,
    )

    assert reopt_res.delta_summary.get("frozen_blocks_preserved") == frozen_count
