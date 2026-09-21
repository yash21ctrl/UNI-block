"""
Security and Cryptography Utilities for RailBlock AI.
Handles modern bcrypt password hashing and JWT authentication tokens.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional
import bcrypt
import jwt
from app.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a stored bcrypt hash.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """
    Generates a secure bcrypt hash for a plain text password.
    """
    # Bcrypt maximum input length is 72 bytes
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def create_access_token(
    subject: str | Any,
    role: str,
    department: Optional[str] = None,
    section: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Creates an encoded JWT access token with role and department claims.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "sub": str(subject),
        "role": role,
        "department": department,
        "section": section,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decodes and verifies a JWT token. Raises PyJWT exceptions on invalidity.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
