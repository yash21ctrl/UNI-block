"""
Main Application Entrypoint for RailBlock AI.
Smart India Hackathon 2026 | Problem Statement 26027.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.logging import setup_logging, get_logger
from app.core.exceptions import RailBlockException, railblock_exception_handler
from app.database import init_db
from app.routers.health import router as health_router
from app.routers.agents import router as agents_router
from app.routers.orchestrator import router as orchestrator_router
from app.routers.ws import router as ws_router

# Setup structured logging
setup_logging()
logger = get_logger("railblock.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager handling database initialization and startup hooks.
    """
    logger.info("Initializing RailBlock AI Platform...", environment=settings.ENVIRONMENT)
    try:
        init_db()
        logger.info("Database schemas initialized.")
    except Exception as exc:
        logger.warning("Database initialization during startup encountered warning", error=str(exc))
    yield
    logger.info("Shutting down RailBlock AI Platform...")


app = FastAPI(
    title="RailBlock AI — Multi-Agent Corridor Operating System",
    description=(
        "Production-grade, multi-agent, explainable AI platform integrating maintenance telemetry "
        "from TMS, SMMS, TDMS, and COA to generate optimized weekly and monthly block schedules "
        "for Indian Railways."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
app.add_exception_handler(RailBlockException, railblock_exception_handler)

# Register Routers
app.include_router(health_router)
app.include_router(agents_router)
app.include_router(orchestrator_router, prefix="/api/v1")
app.include_router(ws_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
def root() -> dict[str, str]:
    """
    Root endpoint returning service identity and documentation links.
    """
    return {
        "service": "RailBlock AI — Multi-Agent Corridor Operating System",
        "hackathon": "Smart India Hackathon 2026 (Problem Statement 26027)",
        "status": "ONLINE",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "agents_api": "/api/v1/agents",
    }
