"""
app.configs
===========

Configurations file for the application
"""

from fastapi import FastAPI

from .middlewares import RateLimitMiddleware
from .routes import router

app = FastAPI()
app.add_middleware(RateLimitMiddleware)
app.include_router(router)
