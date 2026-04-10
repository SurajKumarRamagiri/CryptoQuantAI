from datetime import datetime, timezone
import httpx
from fastapi import APIRouter, Query
from fastapi import HTTPException
from app.schemas.common import ok

router = APIRouter(prefix="/market", tags=["market"])

BINANCE_API_BASE = "https://api.binance.com"
# Supported symbols (all presented as SYMBOL+USDT)
SUPPORTED_SYMBOLS = ["BTCUSDT", "ETHUSDT", "LTCUSDT", "SOLUSDT"]


def _normalize_symbol(input_symbol: str) -> str:
    """Normalize incoming symbol values to the form used in SUPPORTED_SYMBOLS.

    Accepts either 'SOL' or 'SOLUSDT' (case-insensitive) and returns 'SOLUSDT'.
    """
    if not input_symbol:
        return input_symbol
    s = input_symbol.strip().upper()
    # remove common separators like '-', '/'
    s = s.replace("-", "").replace("/", "")
    # If user passed a base like 'SOL', append USDT
    if not s.endswith("USDT"):
        # treat short inputs (<=5) as base symbols
        if len(s) <= 5:
            s = f"{s}USDT"
        else:
            # try to be tolerant: if user passed 'SOLUSDT' with noise, keep uppercased
            s = s
    return s


SUPPORTED_INTERVALS = {"15m", "30m", "1h"}


def _binance_get(path: str, params: dict | None = None) -> dict | list:
    try:
        with httpx.Client(base_url=BINANCE_API_BASE, timeout=10.0) as client:
            response = client.get(path, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail="MARKET_PROVIDER_UNAVAILABLE"
        ) from exc


@router.get("/symbols")
def symbols():
    return ok(SUPPORTED_SYMBOLS)


@router.get("/ticker")
def ticker(symbol: str = Query(default="BTCUSDT")):
    resolved_symbol = _normalize_symbol(symbol)

    # debug: log incoming symbol normalization
    print(f"[market.ticker] incoming='{symbol}' resolved='{resolved_symbol}'")

    # attempt to fetch from provider for any normalized symbol; this makes the
    # endpoint tolerant to inputs like 'SOL' or 'SOLUSDT' and avoids strict
    # server-side whitelisting causing 400 responses for valid assets.
    try:
        price_data = _binance_get("/api/v3/ticker/price", {"symbol": resolved_symbol})
        ticker_data = _binance_get("/api/v3/ticker/24hr", {"symbol": resolved_symbol})
        return ok(
            {
                "symbol": resolved_symbol,
                "price": float(price_data.get("price", 0))
                if isinstance(price_data, dict)
                else 0.0,
                "price_change": float(ticker_data.get("priceChange", 0))
                if isinstance(ticker_data, dict)
                else 0.0,
                "price_change_percent": float(ticker_data.get("priceChangePercent", 0))
                if isinstance(ticker_data, dict)
                else 0.0,
                "volume_24h": float(ticker_data.get("volume", 0))
                if isinstance(ticker_data, dict)
                else 0.0,
                "high_24h": float(ticker_data.get("highPrice", 0))
                if isinstance(ticker_data, dict)
                else 0.0,
                "low_24h": float(ticker_data.get("lowPrice", 0))
                if isinstance(ticker_data, dict)
                else 0.0,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )
    except Exception as exc:
        # Log and return a safe payload so frontend doesn't receive HTTP 400/500
        print(f"market.ticker error for {resolved_symbol}: {exc}")
        return ok(
            {
                "symbol": resolved_symbol,
                "price": 0.0,
                "price_change": 0.0,
                "price_change_percent": 0.0,
                "volume_24h": 0.0,
                "high_24h": 0.0,
                "low_24h": 0.0,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "note": "market provider unavailable",
            }
        )


@router.get("/candles")
def candles(symbol: str = "BTCUSDT", interval: str = "15m", limit: int = 100):
    resolved_symbol = _normalize_symbol(symbol)
    resolved_interval = interval.lower()

    # debug: log incoming symbol/interval
    print(
        f"[market.candles] incoming='{symbol}' resolved='{resolved_symbol}' interval='{resolved_interval}' limit={limit}"
    )

    # Accept any normalized symbol; Binance will return appropriate data or error
    if resolved_interval not in SUPPORTED_INTERVALS:
        raise HTTPException(status_code=400, detail="UNSUPPORTED_INTERVAL")

    resolved_limit = max(1, min(limit, 500))
    rows = _binance_get(
        "/api/v3/klines",
        {
            "symbol": resolved_symbol,
            "interval": resolved_interval,
            "limit": resolved_limit,
        },
    )
    candles_data = [
        {
            "t": int(row[0]),
            "o": float(row[1]),
            "h": float(row[2]),
            "l": float(row[3]),
            "c": float(row[4]),
            "v": float(row[5]),
        }
        for row in rows
    ]
    return ok(
        {
            "symbol": resolved_symbol,
            "interval": resolved_interval,
            "candles": candles_data,
        }
    )


@router.get("/orderbook")
def orderbook(symbol: str = "BTCUSDT"):
    resolved_symbol = _normalize_symbol(symbol)
    if resolved_symbol not in SUPPORTED_SYMBOLS:
        raise HTTPException(status_code=400, detail="UNSUPPORTED_SYMBOL")

    payload = _binance_get("/api/v3/depth", {"symbol": resolved_symbol, "limit": 20})
    bids = [[float(price), float(size)] for price, size in payload.get("bids", [])]
    asks = [[float(price), float(size)] for price, size in payload.get("asks", [])]
    return ok({"symbol": resolved_symbol, "bids": bids, "asks": asks})
