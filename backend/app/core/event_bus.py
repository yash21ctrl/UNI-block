"""
Asynchronous In-Memory Event Bus for RailBlock AI.
Powers real-time pub/sub event streaming to connected Digital Twin frontend clients via WebSockets:
- INGESTION_COMPLETED
- PRIORITY_SCORED
- PLAN_GENERATED
- EMERGENCY_INJECTED
- SAFETY_VIOLATION_BLOCKED
- PLAN_APPROVED
- PLAN_REJECTED
"""

import asyncio
from datetime import datetime, timezone
import json
from typing import Any, Optional

from app.core.logging import get_logger

logger = get_logger("railblock.core.event_bus")


class EventBus:
    """
    High-throughput, in-memory asynchronous publish/subscribe event router.
    """

    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue] = set()
        self._history: list[dict[str, Any]] = []
        self._lock = asyncio.Lock()

    async def publish(self, event_type: str, data: dict[str, Any]) -> dict[str, Any]:
        """
        Publishes an event to all active listener queues in <10ms.
        """
        event = {
            "event_type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }

        async with self._lock:
            # Maintain sliding window of last 100 events
            self._history.append(event)
            if len(self._history) > 100:
                self._history.pop(0)

            subscribers_snapshot = list(self._subscribers)

        # Distribute concurrently to all subscribers
        for queue in subscribers_snapshot:
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                logger.warning("Subscriber queue is full; dropping event", event_type=event_type)

        logger.debug(
            "EventBus published message",
            event_type=event_type,
            active_subscribers=len(subscribers_snapshot),
        )
        return event

    async def subscribe(self, maxsize: int = 100) -> asyncio.Queue:
        """
        Registers a new subscriber and returns its incoming event queue.
        """
        queue: asyncio.Queue = asyncio.Queue(maxsize=maxsize)
        async with self._lock:
            self._subscribers.add(queue)
        logger.debug("New client subscribed to EventBus", total_subscribers=len(self._subscribers))
        return queue

    async def unsubscribe(self, queue: asyncio.Queue) -> None:
        """
        Removes an inactive or disconnected subscriber queue.
        """
        async with self._lock:
            self._subscribers.discard(queue)
        logger.debug("Client unsubscribed from EventBus", remaining_subscribers=len(self._subscribers))

    def get_history(self, limit: int = 20) -> list[dict[str, Any]]:
        """Returns recent broadcast event history."""
        return self._history[-limit:]


# Global EventBus instance for RailBlock AI
event_bus = EventBus()
