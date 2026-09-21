"""
Fusion Agent for RailBlock AI.
Constructs multi-department work packages by clustering compatible maintenance tasks
across Civil Engineering (TMS), Signal & Telecom (SMMS), and Traction Distribution (TDMS).
Leverages NetworkX graph algorithms and greedy packings to minimize total corridor downtime.
"""

from datetime import datetime
from typing import Any, Optional, Union
import networkx as nx

from app.core.logging import get_logger
from app.models.enums import BlockType, Department
from app.models.maintenance import MaintenanceTask
from app.schemas.agent_schemas import WorkPackage

logger = get_logger("railblock.agent.fusion")

# Standard maximum possession window in minutes (e.g. 5 hours)
MAX_CORRIDOR_WINDOW_MINUTES = 300
POWER_BLOCK_SAFETY_MARGIN_MINUTES = 30


class FusionAgent:
    """
    Intelligent graph-theoretic agent that co-locates maintenance operations
    into joint possession work packages to eliminate redundant corridor shutdowns.
    """

    def __init__(self, max_window_minutes: int = MAX_CORRIDOR_WINDOW_MINUTES) -> None:
        self.max_window_minutes = max_window_minutes

    def _get_task_dict(self, task: Union[MaintenanceTask, dict[str, Any]]) -> dict[str, Any]:
        """Normalizes MaintenanceTask ORM instance or raw dictionary into uniform key-value structure."""
        if isinstance(task, dict):
            return {
                "id": task.get("id", 1),
                "section": task.get("section", "NDLS-AGC"),
                "department": task.get("department", "Engineering"),
                "task_type": task.get("task_type", "Routine Maintenance"),
                "priority_score": float(task.get("priority_score", 50.0)),
                "duration_minutes": int(task.get("duration_minutes", 180)),
                "needs_power_block": bool(task.get("needs_power_block", False)),
                "needs_traffic_block": bool(task.get("needs_traffic_block", True)),
                "can_combine": bool(task.get("can_combine", True)),
                "resources_json": task.get("resources_json") or {},
                "km_from": float(task.get("km_from", 0.0)),
                "km_to": float(task.get("km_to", 1.0)),
            }

        # Handle ORM model
        sec = task.corridor.section_code if getattr(task, "corridor", None) else getattr(task, "section", "NDLS-AGC")
        km_from = getattr(task.asset, "km_from", 0.0) if getattr(task, "asset", None) else 0.0
        km_to = getattr(task.asset, "km_to", 1.0) if getattr(task, "asset", None) else 1.0

        return {
            "id": task.id,
            "section": sec,
            "department": task.department.value if hasattr(task.department, "value") else str(task.department),
            "task_type": task.task_type,
            "priority_score": float(task.priority_score),
            "duration_minutes": int(task.duration_minutes),
            "needs_power_block": bool(task.needs_power_block),
            "needs_traffic_block": bool(task.needs_traffic_block),
            "can_combine": bool(task.can_combine),
            "resources_json": task.resources_json or {},
            "km_from": km_from,
            "km_to": km_to,
        }

    def can_combine(
        self,
        a: Union[MaintenanceTask, dict[str, Any]],
        b: Union[MaintenanceTask, dict[str, Any]],
    ) -> tuple[bool, str]:
        """
        Evaluates whether two tasks can safely share a single block window.
        Returns: (is_combinable, reason_message)
        """
        task_a = self._get_task_dict(a)
        task_b = self._get_task_dict(b)

        # 1. Eligibility Check
        if not task_a.get("can_combine", True) or not task_b.get("can_combine", True):
            return False, "One or both tasks are flagged as non-combinable (isolated possession required)."

        # 2. Section Compatibility Check
        sec_a = task_a.get("section")
        sec_b = task_b.get("section")
        if sec_a != sec_b:
            return False, f"Incompatible corridor sections ({sec_a} != {sec_b})."

        # 3. Spatial Co-location / Proximity Check (if km markers present)
        km_from_a = task_a.get("km_from", 0.0)
        km_to_a = task_a.get("km_to", km_from_a + 1.0)
        km_from_b = task_b.get("km_b", task_b.get("km_from", 0.0))
        km_to_b = task_b.get("km_to", km_from_b + 1.0)

        # Indian Railways allows co-location within a 25km block section jurisdiction
        if abs(km_from_a - km_from_b) > 35.0:
            return False, f"Physical distance ({abs(km_from_a - km_from_b):.1f}km) exceeds maximum station section span (35km)."

        # 4. Resource Conflict Check
        res_a = task_a.get("resources_json", {})
        res_b = task_b.get("resources_json", {})
        machinery_a = set(res_a.get("machinery", []))
        machinery_b = set(res_b.get("machinery", []))
        shared_machinery = machinery_a.intersection(machinery_b)
        if shared_machinery:
            return False, f"Machinery conflict: both tasks require exclusive machine {shared_machinery}."

        # 5. Combined Window Duration Fit
        dur_a = task_a.get("duration_minutes", 180)
        dur_b = task_b.get("duration_minutes", 180)

        # When combining, operations run concurrently with setup handover overlap
        # Combined duration is max(dur_a, dur_b) + 30 min buffer if across different departments
        is_cross_dept = task_a.get("department") != task_b.get("department")
        overlap_buffer = 30 if is_cross_dept else 15

        # If one task needs power block, add safety margin
        if task_a.get("needs_power_block") or task_b.get("needs_power_block"):
            overlap_buffer += POWER_BLOCK_SAFETY_MARGIN_MINUTES

        combined_duration = max(dur_a, dur_b) + overlap_buffer

        if combined_duration > self.max_window_minutes:
            return False, (
                f"Combined duration ({combined_duration}m) exceeds corridor allowable "
                f"block window ({self.max_window_minutes}m)."
            )

        benefit = (dur_a + dur_b) - combined_duration
        if benefit <= 15:
            return False, f"Insufficient downtime savings ({benefit}m <= 15m minimum threshold)."

        return True, f"Compatible for Integrated Block. Downtime reduction: {benefit} mins."

    def compute_fusion_benefit(self, tasks: list[Union[MaintenanceTask, dict[str, Any]]]) -> float:
        """
        Calculates total net downtime saved (in minutes) by executing tasks concurrently
        inside a work package versus individual sequential blocks.
        """
        if len(tasks) <= 1:
            return 0.0

        task_dicts = [self._get_task_dict(t) for t in tasks]
        sum_individual = sum(t.get("duration_minutes", 180) for t in task_dicts)
        max_duration = max(t.get("duration_minutes", 180) for t in task_dicts)

        has_power = any(t.get("needs_power_block") for t in task_dicts)
        depts = {t.get("department") for t in task_dicts}

        overhead = 20
        if len(depts) > 1:
            overhead += 20
        if has_power:
            overhead += POWER_BLOCK_SAFETY_MARGIN_MINUTES

        package_duration = max_duration + overhead
        return max(0.0, float(sum_individual - package_duration))

    def to_graph(self, tasks: list[Union[MaintenanceTask, dict[str, Any]]]) -> nx.Graph:
        """
        Constructs a NetworkX graph where nodes represent tasks and edges
        indicate validated combination opportunities weighted by downtime savings.
        """
        graph = nx.Graph()
        task_dicts = [self._get_task_dict(t) for t in tasks]

        # Add nodes with attributes
        for td in task_dicts:
            graph.add_node(td["id"], **td)

        n = len(task_dicts)
        logger.debug("Building fusion compatibility graph...", task_count=n)

        for i in range(n):
            for j in range(i + 1, n):
                t_a = task_dicts[i]
                t_b = task_dicts[j]
                can_fuse, reason = self.can_combine(t_a, t_b)
                if can_fuse:
                    benefit = self.compute_fusion_benefit([t_a, t_b])
                    graph.add_edge(t_a["id"], t_b["id"], weight=benefit, reason=reason)
                    logger.debug(
                        "Fusion edge accepted",
                        task_a=t_a["id"],
                        task_b=t_b["id"],
                        benefit_mins=benefit,
                    )
                else:
                    logger.debug(
                        "Fusion edge rejected",
                        task_a=t_a["id"],
                        task_b=t_b["id"],
                        reason=reason,
                    )

        return graph

    def analyze(self, tasks: list[Union[MaintenanceTask, dict[str, Any]]]) -> list[WorkPackage]:
        """
        Analyzes task list, clusters compatible tasks using NetworkX graph partitioning
        and greedy clique packing, and returns structured WorkPackages.
        """
        if not tasks:
            return []

        task_dicts = {self._get_task_dict(t)["id"]: self._get_task_dict(t) for t in tasks}
        graph = self.to_graph(tasks)

        packages: list[WorkPackage] = []
        visited: set[int] = set()
        package_counter = 1

        # Process each connected component
        for component in nx.connected_components(graph):
            comp_nodes = list(component)

            # Sort candidate nodes by priority score descending
            comp_nodes.sort(key=lambda nid: task_dicts[nid].get("priority_score", 50.0), reverse=True)

            # Greedy clique / cluster extraction within component
            for root_id in comp_nodes:
                if root_id in visited:
                    continue

                cluster = [root_id]
                cluster_section = task_dicts[root_id]["section"]

                for candidate_id in comp_nodes:
                    if candidate_id in visited or candidate_id == root_id:
                        continue

                    # Check if candidate is mutually compatible with all current cluster members
                    can_add = True
                    for member_id in cluster:
                        if not graph.has_edge(member_id, candidate_id):
                            can_add = False
                            break

                    if can_add:
                        # Test if total duration still fits inside max window
                        test_cluster = cluster + [candidate_id]
                        max_dur = max(task_dicts[m]["duration_minutes"] for m in test_cluster)
                        depts = {task_dicts[m]["department"] for m in test_cluster}
                        has_pow = any(task_dicts[m]["needs_power_block"] for m in test_cluster)
                        dur = max_dur + (30 if len(depts) > 1 else 15) + (30 if has_pow else 0)

                        if dur <= self.max_window_minutes and len(cluster) < 4:  # Max 4 tasks per package
                            cluster.append(candidate_id)

                # Mark cluster nodes as visited
                for cid in cluster:
                    visited.add(cid)

                # Create WorkPackage
                cluster_tasks = [task_dicts[cid] for cid in cluster]
                depts = sorted(list({t["department"] for t in cluster_tasks}))
                needs_power = any(t["needs_power_block"] for t in cluster_tasks)
                needs_traffic = any(t["needs_traffic_block"] for t in cluster_tasks)

                if needs_power and needs_traffic:
                    block_type = BlockType.INTEGRATED_BLOCK
                elif needs_power:
                    block_type = BlockType.POWER_BLOCK
                else:
                    block_type = BlockType.TRAFFIC_BLOCK

                max_dur = max(t["duration_minutes"] for t in cluster_tasks)
                overhead = (30 if len(depts) > 1 else 15) + (30 if needs_power else 0)
                pkg_duration = max_dur + overhead if len(cluster) > 1 else max_dur

                sum_isolated = sum(t["duration_minutes"] for t in cluster_tasks)
                benefit = sum_isolated - pkg_duration if len(cluster) > 1 else 0

                # Identify Shadow Tasks (Secondary tasks auto-packed into primary track possession)
                shadow_task_ids: list[int] = []
                shadow_saved_mins = 0
                if len(cluster) > 1:
                    primary_task = max(cluster_tasks, key=lambda x: (x.get("duration_minutes", 0), x.get("priority_score", 0)))
                    shadow_task_ids = [t["id"] for t in cluster_tasks if t["id"] != primary_task["id"]]
                    shadow_saved_mins = sum(t["duration_minutes"] for t in cluster_tasks if t["id"] != primary_task["id"])

                pkg_id = f"PKG-{cluster_section}-{package_counter:03d}"
                package_counter += 1

                if len(cluster) > 1:
                    shadow_note = f" Shadow auto-packer embedded {len(shadow_task_ids)} secondary task(s) saving {shadow_saved_mins}m dedicated closure." if shadow_task_ids else ""
                    reason = (
                        f"Integrated Block combining {len(cluster)} tasks across {', '.join(depts)}. "
                        f"Consolidates {sum_isolated}m separate work into single {pkg_duration}m possession, "
                        f"saving {benefit}m corridor downtime.{shadow_note}"
                    )
                else:
                    reason = f"Standalone maintenance block for {cluster_tasks[0]['task_type']} ({depts[0]})."

                indiv_durations = {str(t["id"]): t["duration_minutes"] for t in cluster_tasks}

                wp = WorkPackage(
                    package_id=pkg_id,
                    section=cluster_section,
                    tasks=cluster,
                    departments=depts,
                    total_duration_minutes=pkg_duration,
                    required_block_type=block_type,
                    fusion_benefit_minutes=benefit,
                    reason=reason,
                    individual_durations=indiv_durations,
                    shadow_tasks=shadow_task_ids,
                    shadow_downtime_saved_minutes=shadow_saved_mins,
                )
                packages.append(wp)

        # Catch any isolated tasks not in graph components
        for tid, t_dict in task_dicts.items():
            if tid not in visited:
                visited.add(tid)
                sec = t_dict["section"]
                dur = t_dict["duration_minutes"]
                dept = t_dict["department"]
                pow_b = t_dict["needs_power_block"]
                traf_b = t_dict["needs_traffic_block"]

                if pow_b and traf_b:
                    b_type = BlockType.INTEGRATED_BLOCK
                elif pow_b:
                    b_type = BlockType.POWER_BLOCK
                else:
                    b_type = BlockType.TRAFFIC_BLOCK

                wp = WorkPackage(
                    package_id=f"PKG-{sec}-{package_counter:03d}",
                    section=sec,
                    tasks=[tid],
                    departments=[dept],
                    total_duration_minutes=dur,
                    required_block_type=b_type,
                    fusion_benefit_minutes=0,
                    reason=f"Standalone {dept} maintenance for task #{tid} ({t_dict.get('task_type')}).",
                    individual_durations={str(tid): dur},
                )
                package_counter += 1
                packages.append(wp)

        total_saved = sum(p.fusion_benefit_minutes for p in packages)
        fused_count = sum(1 for p in packages if len(p.tasks) > 1)

        logger.info(
            "Fusion analysis completed",
            total_tasks=len(tasks),
            work_packages=len(packages),
            fused_packages=fused_count,
            total_downtime_saved_minutes=total_saved,
        )

        return packages
