"""
app.utils.encryption
====================

Encryption helpers for encrypting and decrypting sensitive data for application
"""

from cryptography.fernet import Fernet

from ..settings import ENCRYPTION_KEY


def generate_fernet_key() -> str:
    """Generate and return a new Fernet key."""

    return Fernet.generate_key().decode()


def _get_fernet() -> Fernet:
    """Build the Fernet instance from the configured key."""

    return Fernet(ENCRYPTION_KEY.encode())


def encrypt(value: str) -> str:
    """Encrypt and return a URL-safe Fernet token."""

    return _get_fernet().encrypt(value.encode()).decode()


def decrypt(value: str) -> str:
    """Decrypt a Fernet token and return the original plaintext value."""

    return _get_fernet().decrypt(value.encode()).decode()
