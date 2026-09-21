"""
FastAPI API Routers Package.
"""

from app.routers.health import router as health_router
from app.routers.agents import router as agents_router

__all__ = ["health_router", "agents_router"]
