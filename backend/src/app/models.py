"""
app.models
==========

Models file for the application
"""

from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    google_id: str = Field(unique=True, index=True)
    email: str
    name: str = ""


class GoogleLoginRequest(BaseModel):
    token: str
