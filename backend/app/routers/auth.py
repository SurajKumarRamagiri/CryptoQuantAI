from fastapi import APIRouter, HTTPException, Response, Depends
from app.core.store import store
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.schemas.auth import RegisterRequest, LoginRequest
from app.schemas.common import ok
from app.routers.deps import current_user_id

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(payload: RegisterRequest):
    try:
        user = store.create_user(
            email=payload.email,
            password_hash=hash_password(payload.password),
            display_name=payload.display_name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ok({"user_id": user["id"], "display_name": user["display_name"]})


@router.post("/login")
def login(payload: LoginRequest, response: Response):
    user = store.get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="INVALID_CREDENTIALS")
    access = create_access_token(user["id"])
    refresh = create_refresh_token(user["id"])
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False, samesite="lax")
    return ok({"access_token": access, "token_type": "bearer", "expires_in_min": 15, "display_name": user["display_name"]})


@router.post("/refresh")
def refresh():
    return ok({"message": "Use /login in local demo mode"})


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refresh_token")
    return ok({"message": "logged out"})


@router.get("/me")
def me(user_id: str = Depends(current_user_id)):
    user = store.get_user_by_email(user_id)
    return ok({"user_id": user_id, "display_name": user["display_name"] if user else "Trader"})
