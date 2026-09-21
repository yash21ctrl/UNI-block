"""
FastAPI WebSocket Router for RailBlock AI.
Provides real-time event streaming endpoint:
WS /api/v1/ws/updates
"""

import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.event_bus import event_bus
from app.core.logging import get_logger

logger = get_logger("railblock.router.ws")

router = APIRouter(prefix="/ws", tags=["Real-Time WebSockets"])


@router.websocket("/updates")
async def websocket_updates_endpoint(websocket: WebSocket) -> None:
    """
    Subscribes connected clients to live platform telemetry:
    - INGESTION_COMPLETED
    - PRIORITY_SCORED
    - PLAN_GENERATED
    - EMERGENCY_INJECTED
    - SAFETY_VIOLATION_BLOCKED
    - PLAN_APPROVED / PLAN_REJECTED
    """
    await websocket.accept()
    queue = await event_bus.subscribe()
    logger.info("WebSocket client connected to /api/v1/ws/updates")

    # Send initial connection acknowledgment + recent events
    try:
        await websocket.send_text(
            json.dumps({
                "event_type": "CONNECTED",
                "message": "Connected to RailBlock AI Real-Time Event Stream",
                "recent_events": event_bus.get_history(limit=5),
            })
        )
    except Exception as e:
        logger.warning("Error sending WebSocket welcome frame", error=str(e))
        await event_bus.unsubscribe(queue)
        return

    async def event_forwarder():
        try:
            while True:
                event = await queue.get()
                await websocket.send_text(json.dumps(event))
                queue.task_done()
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.debug("WebSocket forwarder stopped", error=str(e))

    async def client_listener():
        try:
            while True:
                message_text = await websocket.receive_text()
                # Handle heartbeat ping/pong
                if message_text == "ping":
                    await websocket.send_text(json.dumps({"event_type": "PONG"}))
        except (WebSocketDisconnect, asyncio.CancelledError):
            pass
        except Exception as e:
            logger.debug("WebSocket client listener stopped", error=str(e))

    forwarder_task = asyncio.create_task(event_forwarder())
    listener_task = asyncio.create_task(client_listener())

    try:
        done, pending = await asyncio.wait(
            [forwarder_task, listener_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for task in pending:
            task.cancel()
    finally:
        await event_bus.unsubscribe(queue)
        logger.info("WebSocket client disconnected from /api/v1/ws/updates")
