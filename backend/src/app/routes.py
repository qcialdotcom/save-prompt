"""
app.routes
==========

Routes file for the application
"""

from fastapi import APIRouter, HTTPException
from sqlmodel import Session, create_engine, select

from .models import GoogleLoginRequest, User
from .settings import DATABASE_URL
from .utils.google import verify_google_token
from .utils.jwt import create_tokens

engine = create_engine(DATABASE_URL)

router = APIRouter()


@router.post("/auth/google/login")
def google_login(body: GoogleLoginRequest):
    try:
        claims = verify_google_token(body.token)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Google authentication could not be completed. Please try again.",
        )

    # Check if the email is verified
    if not claims.get("email_verified"):
        raise HTTPException(
            status_code=400, detail="Your Google account email address is not verified."
        )

    # Check if the email is a Gmail account
    if not claims.get("email", "").endswith("@gmail.com"):
        raise HTTPException(
            status_code=400, detail="Only Gmail accounts are allowed to login."
        )

    # chekc if the sub claim is present in the claims
    if not claims.get("sub"):
        raise HTTPException(
            status_code=400, detail="Google authentication could not be completed."
        )

    with Session(engine) as session:
        user = session.exec(select(User).where(User.google_id == claims["sub"])).first()

        if not user:
            user = User(
                google_id=claims["sub"],
                email=claims["email"],
                name=claims.get("name", ""),
            )
            session.add(user)
            session.commit()
            session.refresh(user)

        return create_tokens(user.id)
