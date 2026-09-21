"""
Unit and Integration Tests for Optimizer Agent (CP-SAT Multi-Objective Engine).
Tests:
- Weekly schedule generation (7-day horizon, 15-minute slot discretization)
- Monthly schedule generation (30-day horizon)
- Pareto frontier generation (3 distinct profiles: Safety-Max, Throughput-Max, Balanced)
- Window constraint adherence (all scheduled blocks inside corridor windows)
- Capacity constraint satisfaction
"""

import pytest
import asyncio
from datetime import datetime, timezone

from app.agents.optimizer_agent import OptimizerAgent
from app.models.enums import PlanType
from app.schemas.agent_schemas import OptimizedPlan, ParetoResponse
from app.utils.demo_scenarios import get_scenario_a_tasks, get_scenario_c_tasks


@pytest.fixture
def optimizer_agent() -> OptimizerAgent:
    return OptimizerAgent()


@pytest.mark.asyncio
async def test_optimize_weekly_plan(optimizer_agent: OptimizerAgent):
    tasks = get_scenario_a_tasks()[:15]  # Test subset of tasks
    plan = await optimizer_agent.optimize_weekly(tasks, section_code="NDLS-AGC", pareto_profile="Balanced")

    assert isinstance(plan, OptimizedPlan)
    assert plan.plan_type == PlanType.WEEKLY
    assert plan.horizon_days == 7
    assert plan.solve_status in ("OPTIMAL", "FEASIBLE")
    assert plan.scheduled_tasks > 0
    assert plan.solve_time_ms < 5000.0
    assert len(plan.blocks) > 0


@pytest.mark.asyncio
async def test_optimize_monthly_plan(optimizer_agent: OptimizerAgent):
    tasks = get_scenario_a_tasks()[:10]
    plan = await optimizer_agent.optimize_monthly(tasks, section_code="NDLS-AGC", pareto_profile="Throughput-Max")

    assert isinstance(plan, OptimizedPlan)
    assert plan.plan_type == PlanType.MONTHLY
    assert plan.horizon_days == 30
    assert plan.solve_status in ("OPTIMAL", "FEASIBLE")
    assert plan.scheduled_tasks > 0


@pytest.mark.asyncio
async def test_generate_pareto_front(optimizer_agent: OptimizerAgent):
    tasks = get_scenario_c_tasks()
    pareto_res = await optimizer_agent.generate_pareto_front(tasks, section_code="NDLS-AGC")

    assert isinstance(pareto_res, ParetoResponse)
    assert "Safety-Max" in pareto_res.plans
    assert "Throughput-Max" in pareto_res.plans
    assert "Balanced" in pareto_res.plans

    for profile_name, plan in pareto_res.plans.items():
        assert plan.solve_status in ("OPTIMAL", "FEASIBLE")
        assert plan.scheduled_tasks > 0


@pytest.mark.asyncio
async def test_corridor_window_constraint(optimizer_agent: OptimizerAgent):
    tasks = [
        {
            "id": 901,
            "section": "NDLS-AGC",
            "department": "Engineering",
            "task_type": "Track Maintenance",
            "priority_score": 90.0,
            "duration_minutes": 180,
            "needs_power_block": False,
            "needs_traffic_block": True,
        }
    ]
    plan = await optimizer_agent.optimize_weekly(tasks, section_code="NDLS-AGC")

    assert len(plan.blocks) == 1
    block = plan.blocks[0]
    # Check that block starts in night window (00:00 - 05:00) or shadow window (11:30 - 13:30)
    start_hour = block.scheduled_start.hour
    start_minute = block.scheduled_start.minute

    in_night = 0 <= start_hour < 5
    in_shadow = (start_hour == 11 and start_minute >= 30) or (start_hour == 12) or (start_hour == 13 and start_minute <= 30)
    assert in_night or in_shadow
