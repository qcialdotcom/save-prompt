"""
app.settings
============

Settings file for the application
"""

import os

from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

UPSTASH_REDIS_REST_URL = os.getenv("UPSTASH_REDIS_REST_URL", "")
UPSTASH_REDIS_REST_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ACCESS_TTL = int(os.getenv("JWT_ACCESS_TTL", "900"))
JWT_REFRESH_TTL = int(os.getenv("JWT_REFRESH_TTL", "2592000"))
