import asyncio
from datetime import datetime, timezone
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx

from app.core.config import settings
from app.routers import auth, market, models, orders, portfolio, research
from app.routers.deps import current_user_id, optional_user_id
from app.schemas.common import err

app = FastAPI(title="DriftForge API", version="1.0.0")

app.dependency_overrides[current_user_id] = optional_user_id

BINANCE_WS_BASE = "wss://stream.binance.com:9443/ws"
# include SOL so frontend chart receives live ticker updates for SOL
SUPPORTED_WS_SYMBOLS = ["btcusdt", "ethusdt", "ltcusdt", "solusdt"]


def _parse_cors_origins(raw_origins: str) -> list[str]:
    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    if not origins:
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5176",
            "http://localhost:5177",
            "http://localhost:5178",
            "http://localhost:5179",
        ]
    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.exception_handler(Exception)
async def fallback_error_handler(_, exc: Exception):
    return JSONResponse(status_code=500, content=err("INTERNAL_ERROR", str(exc)))


async def _fetch_current_prices() -> dict:
    prices = {}
    try:
        async with httpx.AsyncClient(
            base_url="https://api.binance.com", timeout=5.0
        ) as client:
            response = await client.get("/api/v3/ticker/price")
            if response.status_code == 200:
                for item in response.json():
                    symbol = item["symbol"].lower()
                    if symbol in SUPPORTED_WS_SYMBOLS:
                        prices[symbol.upper()] = float(item["price"])
    except Exception:
        pass
    return prices


async def _stream_binance_prices(websocket: WebSocket, symbols: list[str]) -> None:
    streams = "/".join([f"{symbol.lower()}@ticker" for symbol in symbols])
    ws_url = f"{BINANCE_WS_BASE}/{streams}"

    try:
        async with httpx.AsyncClient() as client:
            async with client.stream("GET", ws_url) as response:
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                        if "data" in data:
                            ticker = data["data"]
                            symbol = ticker.get("s", "")
                            price = ticker.get("c", "0")
                            await websocket.send_json(
                                {
                                    "event_type": "ticker_update",
                                    "event_version": "v1",
                                    "event_id": f"binance-{symbol}",
                                    "server_timestamp": datetime.now(
                                        timezone.utc
                                    ).isoformat(),
                                    "trace_id": f"ws-{symbol}",
                                    "payload": {
                                        "symbol": symbol,
                                        "price": float(price),
                                        "price_change": float(ticker.get("p", 0)),
                                        "price_change_percent": float(
                                            ticker.get("P", 0)
                                        ),
                                        "high_24h": float(ticker.get("h", 0)),
                                        "low_24h": float(ticker.get("l", 0)),
                                        "volume_24h": float(ticker.get("v", 0)),
                                    },
                                }
                            )
                    except json.JSONDecodeError:
                        continue
    except Exception:
        pass


async def _fallback_ticker_feed(websocket: WebSocket) -> None:
    prices = await _fetch_current_prices()
    while True:
        for symbol, price in prices.items():
            await websocket.send_json(
                {
                    "event_type": "ticker_update",
                    "event_version": "v1",
                    "event_id": f"fallback-{symbol}",
                    "server_timestamp": datetime.now(timezone.utc).isoformat(),
                    "trace_id": f"fb-{symbol}",
                    "payload": {
                        "symbol": symbol,
                        "price": price,
                    },
                }
            )
        await asyncio.sleep(2)


@app.websocket("/ws/market")
async def ws_market(websocket: WebSocket):
    await websocket.accept()
    try:
        # stream all supported symbols (uppercase form)
        await _stream_binance_prices(
            websocket, [s.upper() for s in SUPPORTED_WS_SYMBOLS]
        )
    except Exception:
        pass

    try:
        await _fallback_ticker_feed(websocket)
    except Exception:
        pass


app.include_router(auth.router, prefix="/api/v1")
app.include_router(market.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(portfolio.router, prefix="/api/v1")
app.include_router(models.router, prefix="/api/v1")
app.include_router(research.router, prefix="/api/v1")
