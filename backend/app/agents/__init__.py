"""
Multi-Agent Orchestration Package for RailBlock AI:
- IngestionAgent: Normalization and quality firewall for TMS/SMMS/TDMS/COA
- PriorityAgent: Urgency scoring (0-100) using XGBoost and TreeSHAP explainability
- Orchestrator: Coordinator for end-to-end multi-agent pipelines
"""

from app.agents.ingestion_agent import IngestionAgent
from app.agents.priority_agent import PriorityAgent
from app.agents.orchestrator import Orchestrator

__all__ = [
    "IngestionAgent",
    "PriorityAgent",
    "Orchestrator",
]
