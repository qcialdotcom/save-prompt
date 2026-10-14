"""
app.middlewares
===============

Middlewares file for the application
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from upstash_ratelimit import Ratelimit, SlidingWindow
from upstash_redis import Redis

from .settings import UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL

redis = Redis(
    url=UPSTASH_REDIS_REST_URL,
    token=UPSTASH_REDIS_REST_TOKEN,
)

rate_limiter = Ratelimit(
    redis=redis,
    limiter=SlidingWindow(max_requests=30, window=60),
    prefix="save-prompt:ratelimit",
)


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"

        result = await rate_limiter.limit(client_ip)

        if not result.allowed:
            return JSONResponse(
                status_code=429,
                content={"message": "Too many requests. You have sent too many requests in a short period of time. Please try after few moments."},
                headers={"Retry-After": "60"},
            )

        return await call_next(request)
