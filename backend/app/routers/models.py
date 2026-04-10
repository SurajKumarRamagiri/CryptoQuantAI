from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from app.schemas.common import ok
from app.routers.deps import current_user_id, optional_user_id
from app.services.model_registry import registry

router = APIRouter(prefix="/models", tags=["models"])

SOL_TO_LTC_MAP = {
    "SOLUSDT": "LTCUSDT",
    "SOL": "LTC",
}


def _resolve_symbol_for_model(symbol: str) -> str:
    normalized = symbol.upper().replace("-", "").replace("_", "")
    if normalized in SOL_TO_LTC_MAP:
        return SOL_TO_LTC_MAP[normalized]
    return symbol.upper()


def _build_inference_payload(candles: list[dict], timeframe: str) -> dict:
    if not candles or len(candles) < 20:
        return {
            "sequence": [[0.0] * 12] * 20,
            "symbol": "BTCUSDT",
            "timeframe": timeframe,
        }

    recent = candles[-20:]
    features = []
    for c in recent:
        o, h, l, c_price, v = (
            c.get("o", 0),
            c.get("h", 0),
            c.get("l", 0),
            c.get("c", 0),
            c.get("v", 0),
        )
        features.append(
            [
                float(o),
                float(h),
                float(l),
                float(c_price),
                float(v),
                float(h - l),
                float(c_price - o),
                float(v) if v else 0.0,
                0.0,
                0.0,
                0.0,
                0.0,
            ]
        )

    return {
        "sequence": features,
        "symbol": recent[0].get("symbol", "BTCUSDT"),
        "timeframe": timeframe,
    }


@router.get("")
def list_models():
    available_models = [
        {"id": "random-forest", "name": "Random Forest", "desc": "Stable predictions"},
        {"id": "xgboost", "name": "XGBoost", "desc": "Fast & accurate"},
        {"id": "lstm", "name": "LSTM", "desc": "Long short-term memory"},
        {"id": "gru", "name": "GRU", "desc": "Gated recurrent unit"},
        {
            "id": "gru-xgboost",
            "name": "GRU+XGBoost Hybrid",
            "desc": "Best overall performance",
        },
    ]
    return ok(available_models)


@router.get("/active")
def active_models(
    symbol: str = "BTCUSDT",
    timeframe: str = "1m",
    user_id: str = Depends(current_user_id),
):
    return ok(
        {
            "symbol": symbol,
            "timeframe": timeframe,
            "models": registry.active_models(symbol, timeframe),
        }
    )


@router.get("/metrics")
def model_metrics(
    symbol: str = "BTCUSDT",
    timeframe: str = "1m",
    model: str = "hybrid-gru-xgboost",
    user_id: str = Depends(current_user_id),
):
    return ok(
        {
            "symbol": symbol,
            "timeframe": timeframe,
            "model": model,
            "macro_f1": 0.67,
            "sharpe": 1.21,
            "max_drawdown": -0.14,
        }
    )


@router.get("/predict", include_in_schema=False)
def predict(
    symbol: str = Query(default="BTCUSDT"),
    timeframe: str = Query(default="15m"),
    model_name: str = Query(default="hybrid-gru-xgboost"),
    user_id: str | None = Depends(optional_user_id),
):
    from app.routers import market

    candles_data = market._binance_get(
        "/api/v3/klines",
        {"symbol": symbol.upper(), "interval": timeframe.lower(), "limit": 50},
    )
    candles = [
        {
            "symbol": symbol.upper(),
            "o": float(row[1]),
            "h": float(row[2]),
            "l": float(row[3]),
            "c": float(row[4]),
            "v": float(row[5]),
            "t": int(row[0]),
        }
        for row in candles_data
    ]

    model_symbol = _resolve_symbol_for_model(symbol)
    payload = _build_inference_payload(candles, timeframe)
    payload["symbol"] = model_symbol

    result = registry.predict(model_name=model_name, payload=payload)

    predicted_class = result.get("predicted_class", "Unknown")
    confidence = result.get("confidence_score", 0.0)
    class_probs = result.get("class_probabilities", {})

    signal_type = "HOLD"
    if predicted_class == "Up":
        signal_type = "BUY"
    elif predicted_class == "Down":
        signal_type = "SELL"

    target_move = (
        f"+{confidence * 2:.1}%"
        if signal_type == "BUY"
        else f"-{confidence * 2:.1}%"
        if signal_type == "SELL"
        else "0%"
    )
    risk_level = "Low" if confidence < 0.5 else "Medium" if confidence < 0.7 else "High"

    last_price = candles[-1]["c"] if candles else 0
    tp = (
        last_price * (1 + confidence * 0.02)
        if signal_type == "BUY"
        else last_price * (1 - confidence * 0.02)
    )
    sl = (
        last_price * (1 - confidence * 0.01)
        if signal_type == "BUY"
        else last_price * (1 + confidence * 0.01)
    )

    return ok(
        {
            "type": signal_type,
            "confidence": int(confidence * 100),
            "targetMove": target_move,
            "risk": risk_level,
            "tp": f"{tp:,.0f}",
            "sl": f"{sl:,.0f}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "symbol": symbol.upper(),
            "timeframe": timeframe,
            "model_used": result.get("model_name", model_name),
            "model_symbol": model_symbol,
            "class_probabilities": class_probs,
            "raw_prediction": result,
        }
    )


@router.post("/predict/{model_name}")
def predict_post(
    model_name: str, payload: dict, user_id: str = Depends(current_user_id)
):
    result = registry.predict(model_name=model_name, payload=payload)
    return ok(
        {
            **result,
            "inference_timestamp": datetime.now(timezone.utc).isoformat(),
            "trace_id": "local",
        }
    )
