from fastapi import Header, HTTPException
from jose import JWTError
from app.core.security import decode_access_token


def current_user_id(authorization: str | None = Header(default=None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="AUTH_REQUIRED")
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="AUTH_REQUIRED")
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="AUTH_FORBIDDEN") from exc
    return str(payload["sub"])


def optional_user_id(authorization: str | None = Header(default=None)) -> str | None:
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
        return str(payload["sub"])
    except JWTError:
        return None
