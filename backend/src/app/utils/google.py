"""
app.utils.google
================

Google helpers for verifying Google ID tokens for application
"""

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from ..settings import GOOGLE_CLIENT_ID


def verify_google_token(token: str) -> dict:
    """
    Verify a Google ID token and return its claims.

    Raises ValueError if the token is invalid or expired.
    """
    return id_token.verify_oauth2_token(
        token, google_requests.Request(), GOOGLE_CLIENT_ID
    )
