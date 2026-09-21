"""
Custom Domain Exceptions and Error Handlers for RailBlock AI.
"""

from typing import Any, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse


class RailBlockException(Exception):
    """Base exception class for RailBlock AI domain errors."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[dict[str, Any]] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class EntityNotFoundException(RailBlockException):
    """Raised when an asset, corridor, task, or block plan is not found."""

    def __init__(self, entity_name: str, identifier: Any) -> None:
        super().__init__(
            message=f"{entity_name} with identifier '{identifier}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"entity": entity_name, "identifier": str(identifier)},
        )


class OptimizationTimeoutException(RailBlockException):
    """Raised when the CP-SAT optimizer fails to converge within the 5s SLA."""

    def __init__(self, timeout_seconds: float) -> None:
        super().__init__(
            message=f"Corridor optimization exceeded maximum SLA limit of {timeout_seconds} seconds.",
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            details={"timeout_seconds": timeout_seconds},
        )


class CorridorConflictException(RailBlockException):
    """Raised when an unscheduled block violates block window or section capacity."""

    def __init__(self, section_code: str, reason: str) -> None:
        super().__init__(
            message=f"Block scheduling conflict detected on corridor {section_code}: {reason}",
            status_code=status.HTTP_409_CONFLICT,
            details={"section_code": section_code, "reason": reason},
        )


class SafetyViolationException(RailBlockException):
    """Raised by the Guardian Agent when a safety rule or premium train headway is breached."""

    def __init__(self, rule_name: str, violation_details: str) -> None:
        super().__init__(
            message=f"Guardian Agent Safety Rule Violated ({rule_name}): {violation_details}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details={"rule_name": rule_name, "violation": violation_details},
        )


class InvalidBlockWindowException(RailBlockException):
    """Raised when proposed block timings fall outside permitted operational windows."""

    def __init__(self, window_start: str, window_end: str) -> None:
        super().__init__(
            message=f"Proposed block window ({window_start} - {window_end}) is not permitted.",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={"window_start": window_start, "window_end": window_end},
        )


class AuthenticationException(RailBlockException):
    """Raised when credentials or token validation fails."""

    def __init__(self, message: str = "Invalid authentication credentials.") -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class AuthorizationException(RailBlockException):
    """Raised when a user lacks required Indian Railways role authority (e.g. DRM/GM approval)."""

    def __init__(self, required_role: str) -> None:
        super().__init__(
            message=f"Action requires elevated Railway Controller authority: {required_role}.",
            status_code=status.HTTP_403_FORBIDDEN,
            details={"required_role": required_role},
        )


class DataIngestionException(RailBlockException):
    """Raised when TMS/SMMS/TDMS/COA feed payload fails normalization."""

    def __init__(self, source_system: str, reason: str) -> None:
        super().__init__(
            message=f"Ingestion failed for system '{source_system}': {reason}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details={"source_system": source_system, "reason": reason},
        )


async def railblock_exception_handler(
    request: Request, exc: RailBlockException
) -> JSONResponse:
    """
    Global exception handler for all RailBlock custom domain exceptions.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "message": exc.message,
                "type": exc.__class__.__name__,
                "details": exc.details,
            },
        },
    )
