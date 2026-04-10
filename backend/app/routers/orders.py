from fastapi import APIRouter, Depends, HTTPException
from app.core.store import store
from app.schemas.common import ok
from app.schemas.orders import OrderRequest
from app.routers.deps import current_user_id

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("")
def create_order(payload: OrderRequest, user_id: str = Depends(current_user_id)):
    try:
        order = store.place_order(user_id, payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ok(order)


@router.get("")
def list_orders(user_id: str = Depends(current_user_id)):
    return ok(store.list_orders(user_id))


@router.get("/open")
def list_open_orders(symbol: str | None = None, user_id: str = Depends(current_user_id)):
    return ok(store.list_open_orders(user_id=user_id, symbol=symbol))


@router.post("/{order_id}/cancel")
def cancel_order(order_id: str, user_id: str = Depends(current_user_id)):
    try:
        order = store.cancel_order(user_id=user_id, order_id=order_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not order:
        raise HTTPException(status_code=404, detail="RESOURCE_NOT_FOUND")
    return ok(order)
