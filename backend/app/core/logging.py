"""
Structured Logging Configuration using structlog.
Provides production-grade JSON or console logging for all multi-agent actions.
"""

import logging
import sys
from typing import Any
import structlog
from app.config import settings


def setup_logging() -> None:
    """
    Configures standard library logging and structlog processors.
    Outputs structured JSON in production and readable colorized logs in development.
    """
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    shared_processors: list[Any] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    if settings.ENVIRONMENT == "production":
        shared_processors.append(structlog.processors.JSONRenderer())
    else:
        shared_processors.append(
            structlog.dev.ConsoleRenderer(colors=True, pad_event_to=30)
        )

    structlog.configure(
        processors=shared_processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )


def get_logger(name: str = "railblock") -> structlog.stdlib.BoundLogger:
    """
    Returns a configured structlog bound logger.
    """
    return structlog.get_logger(name)
