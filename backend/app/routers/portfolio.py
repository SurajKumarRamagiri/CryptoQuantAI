from fastapi import APIRouter, Depends
from fastapi import HTTPException
from app.core.store import store
from app.schemas.common import ok
from app.routers.deps import current_user_id

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("")
def get_portfolio(user_id: str = Depends(current_user_id)):
    return ok(store.get_portfolio(user_id))


@router.get("/holdings")
def holdings(user_id: str = Depends(current_user_id)):
    return ok(store.get_holdings(user_id))


@router.get("/pnl")
def pnl(range: str = "1D", user_id: str = Depends(current_user_id)):
    p = store.get_portfolio(user_id)
    return ok({"range": range, "realized_pnl": p["realized_pnl"], "unrealized_pnl": p["unrealized_pnl"]})


@router.post("/reset-funds")
def reset_funds(user_id: str = Depends(current_user_id)):
    return ok(store.reset_funds(user_id))


@router.post("/collect-credits")
def collect_credits(user_id: str = Depends(current_user_id)):
    try:
        data = store.collect_credits(user_id=user_id, amount=5000.0)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ok(data)


@router.get("/updates")
def updates(user_id: str = Depends(current_user_id)):
    return ok(store.get_updates(user_id))
