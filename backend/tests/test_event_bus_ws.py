"""
Unit and Integration Tests for EventBus & WebSockets (/api/v1/ws/updates).
Tests:
- In-memory pub/sub message dispatch and queue management
- Sliding window history retrieval
- Live WebSocket connection, ping/pong heartbeat, and event broadcasting
"""

import asyncio
import json
import pytest
from fastapi.testclient import TestClient

from app.core.event_bus import event_bus


@pytest.mark.asyncio
async def test_event_bus_publish_and_subscribe():
    queue = await event_bus.subscribe()
    assert queue is not None

    test_payload = {"plan_id": "PLAN-TEST-001", "section": "NDLS-AGC"}
    published = await event_bus.publish("PLAN_GENERATED", test_payload)

    assert published["event_type"] == "PLAN_GENERATED"
    assert published["data"] == test_payload

    # Receive from queue
    event = await asyncio.wait_for(queue.get(), timeout=2.0)
    assert event["event_type"] == "PLAN_GENERATED"
    assert event["data"]["plan_id"] == "PLAN-TEST-001"

    await event_bus.unsubscribe(queue)


def test_event_bus_history():
    history = event_bus.get_history(limit=10)
    assert isinstance(history, list)


def test_websocket_connection_and_heartbeat(client: TestClient):
    with client.websocket_connect("/api/v1/ws/updates") as websocket:
        # Initial greeting frame
        welcome = websocket.receive_json()
        assert welcome["event_type"] == "CONNECTED"

        # Send ping
        websocket.send_text("ping")
        response = websocket.receive_json()
        assert response["event_type"] == "PONG"
