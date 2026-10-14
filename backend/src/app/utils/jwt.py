"""
app.utils.jwt
=============

JWT helpers for creating access and refresh tokens for application
"""

from datetime import UTC, datetime, timedelta

import jwt as jwt_lib

from ..settings import JWT_ACCESS_TTL, JWT_REFRESH_TTL, JWT_SECRET


def _create_token(user_id: int, token_type: str, ttl: int) -> str:
    """Create a JWT token for the given user and token type."""

    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "iat": now,
        "exp": now + timedelta(seconds=ttl),
    }
    return jwt_lib.encode(payload, JWT_SECRET, algorithm="HS256")


def create_tokens(user_id: int) -> dict:
    """Return access and refresh JWTs for the given user."""

    return {
        "access": _create_token(user_id, "access", JWT_ACCESS_TTL),
        "refresh": _create_token(user_id, "refresh", JWT_REFRESH_TTL),
    }
