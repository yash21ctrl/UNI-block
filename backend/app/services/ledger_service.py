"""
AI Decision Ledger & Audit Trail Service for RailBlock AI.
Provides immutable persistence and querying for:
- Agent decision traces (ai_decisions table)
- Human-in-the-loop controller approvals, overrides, and rejections (audit_log table)
"""

from datetime import datetime, timezone
from typing import Any, Optional
from sqlalchemy import select, desc
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.models.ai_decision import AIDecision
from app.models.audit import AuditLog

logger = get_logger("railblock.service.ledger")


class LedgerService:
    """
    Immutable ledger service maintaining complete regulatory auditability
    for autonomous agent inferences and Section Controller actions.
    """

    @staticmethod
    def record_ai_decision(
        db: Session,
        plan_id: int,
        agent_name: str,
        decision_json: dict[str, Any],
        explanation_text: str,
        shap_values_json: Optional[dict[str, Any]] = None,
        confidence: float = 0.95,
    ) -> AIDecision:
        """
        Appends an immutable record of an agent's reasoning into ai_decisions table.
        """
        record = AIDecision(
            plan_id=plan_id,
            agent_name=agent_name,
            decision_json=decision_json,
            explanation_text=explanation_text,
            shap_values_json=shap_values_json or {},
            confidence=confidence,
            timestamp=datetime.now(timezone.utc),
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        logger.debug(
            "Recorded AI decision trace",
            plan_id=plan_id,
            agent_name=agent_name,
            decision_id=record.id,
        )
        return record

    @staticmethod
    def record_audit_action(
        db: Session,
        action: str,
        entity_type: str,
        entity_id: int,
        user_id: Optional[int] = None,
        before_json: Optional[dict[str, Any]] = None,
        after_json: Optional[dict[str, Any]] = None,
    ) -> AuditLog:
        """
        Records human-in-the-loop actions (APPROVE, REJECT, OVERRIDE) in audit_log table.
        """
        audit_entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            before_json=before_json or {},
            after_json=after_json or {},
            timestamp=datetime.now(timezone.utc),
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)

        logger.info(
            "Audit action recorded",
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
        )
        return audit_entry

    @staticmethod
    def get_plan_ledger(db: Session, plan_id: int) -> dict[str, Any]:
        """
        Fetches complete chronological decision trace and audit log for a block plan.
        """
        # 1. Fetch AI decisions
        stmt_decisions = (
            select(AIDecision)
            .where(AIDecision.plan_id == plan_id)
            .order_by(AIDecision.timestamp.asc())
        )
        decisions = db.execute(stmt_decisions).scalars().all()

        # 2. Fetch Human Actions
        stmt_audit = (
            select(AuditLog)
            .where(AuditLog.entity_type == "block_plans", AuditLog.entity_id == plan_id)
            .order_by(AuditLog.timestamp.desc())
        )
        audit_logs = db.execute(stmt_audit).scalars().all()

        return {
            "plan_id": plan_id,
            "total_agent_decisions": len(decisions),
            "total_audit_actions": len(audit_logs),
            "agent_decisions": [
                {
                    "id": d.id,
                    "agent_name": d.agent_name,
                    "explanation": d.explanation_text,
                    "confidence": d.confidence,
                    "shap_values": d.shap_values_json,
                    "decision_data": d.decision_json,
                    "timestamp": d.timestamp.isoformat(),
                }
                for d in decisions
            ],
            "audit_actions": [
                {
                    "id": a.id,
                    "action": a.action,
                    "user_id": a.user_id,
                    "before": a.before_json,
                    "after": a.after_json,
                    "timestamp": a.timestamp.isoformat(),
                }
                for a in audit_logs
            ],
        }
