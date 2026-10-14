"""
app.configs
===========

Configurations file for the application
"""

from fastapi import FastAPI

from .middlewares import RateLimitMiddleware

app = FastAPI()
app.add_middleware(RateLimitMiddleware)
