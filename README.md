
# CryptoQuantAI

CryptoQuantAI is a prototype trading dashboard demonstrating real‑time market feeds, ML/DL model inference (including hybrid ensembles), and a small paper‑trading store. It pairs a React + Vite frontend with a FastAPI backend.

Contents
- `frontend/` — React (Vite) SPA, UI components, and API client
- `backend/` — FastAPI app: REST routers, WebSocket feed, model registry and inference, persistent store
- `context/`, `contracts/`, `db/`, `tests/` — supporting artifacts and documentation

Quick start (development)
1. Environment Setup:
   - Copy `.env.example` to `.env` in the root folder.
   - Set `DATABASE_URL` to a valid Supabase PostgreSQL connection string (**Required:** The backend will instantly crash without this).
   - Ensure you manually download the model binaries into the `models/` directory in the project root (these are not tracked by Git).
2. Install dependencies:
   - Frontend: `pnpm --dir frontend install`
   - Backend: Activate a virtual environment, then run `pip install -r backend/requirements.txt`
3. Start the application (from repo root):
   - The easiest way is to run `python start_dev.py` which launches both services.
   - Or start manually: `cd backend && python -m uvicorn app.main:app --reload --port 8000` and `pnpm --dir frontend dev`.

Environment variables
- `DATABASE_URL` — **CRITICAL**: Required by backend PersistentStore (Supabase Postgres connection string expected).
- `REDIS_URL` — Local docker reference. Not actively used by the local IDE python backend.
- `CORS_ORIGINS` — comma separated origins allowed by CORS (frontend dev ports are included by default)
- `VITE_API_BASE_URL`, `VITE_WS_BASE_URL` — used by frontend when running against non-default backend

Architecture (high level)
- Frontend
  - Central API client: `frontend/src/shared/api/client.js` (1‑minute cache for inference results)
  - Dashboard pages: `frontend/src/pages/Dashboard.jsx` wires together `ControlBar`, `ChartSection`, `SignalPanel`, `MarketStats`.
- Backend
  - `backend/app/main.py` — FastAPI app bootstrap, CORS, websocket `/ws/market`, and routing includes
  - `backend/app/routers/market.py` — market endpoints (`/market/ticker`, `/market/candles`, `/market/orderbook`) and Binance integration
  - `backend/app/routers/models.py` — model listing and `/models/predict` inference endpoint (builds features from live candles)
  - `backend/app/services/model_registry.py` — artifact discovery, ML (.joblib) & DL (.pt/.pth) loaders, AttnRNNClassifier for GRU/LSTM, hybrid fusion logic and caching
  - `backend/app/core/store.py` — persistent store, paper trading helpers, short price cache

Model artifact conventions
- Directory: By default the registry looks in the `models/` folder at the root of the project.
- Filename pattern: `<SYMBOL>_<TIMEFRAME>_<MODELKEY>.<ext>` — example `BTC_15m_xgb.joblib` or `BTC_15m_gru.pt`.
- Supported artifact extensions: `.joblib` for scikit-learn/xgboost/rf, `.pt` / `.pth` for PyTorch RNN models.
- Scaler naming (optional): `<SYMBOL>_<TIMEFRAME>_scaler.joblib` or model‑specific scaler variations. If present the scaler will be applied before ML prediction.
- Hybrid models: a joblib artifact with model_name `hybrid-gru-xgboost` is paired with a corresponding GRU torch artifact (named with `hybrid_gru` key) — registry fuses probabilities (average + renormalize).

API Overview
- GET /api/v1/market/ticker?symbol=BTCUSDT — latest price + 24h stats
- GET /api/v1/market/candles?symbol=BTCUSDT&interval=15m&limit=100 — klines (OHLCV)
- GET /api/v1/market/orderbook?symbol=BTCUSDT — depth snapshot
- GET /api/v1/models — available model families
- GET /api/v1/models/predict?symbol=BTCUSDT&timeframe=15m&model_name=gru-xgboost — run inference on live candles (frontend caches 60s)
- WebSocket: ws://<host>/ws/market — real‑time ticker feed used by chart updates

Notes on inference flow
- The `/models/predict` endpoint fetches recent candles from Binance, constructs a 20‑step sequence of 12 numeric features per candle (o,h,l,c,v,h-l,c-o,v, plus padding zeros), maps symbols where necessary (eg. SOL→LTC when using LTC models), and dispatches to the registry.
- Joblib models: features → scaler (if present) → model.predict/_predict_proba
- Torch models: sequence → tensor → single forward pass on `AttnRNNClassifier` with attention → softmax
- Hybrids: joblib + torch probs are averaged and normalized to produce a consensus probability vector

Operational notes & troubleshooting
- If SOL or other symbols fail, check `backend/app/routers/market.py` normalization and the websocket symbol list in `backend/app/main.py`.
- First inference for a model may be slow due to disk load; models are cached in memory after first load.
- To reduce startup latency, consider preloading common artifacts at backend start (not implemented by default).

Development practices
- Frontend style: 2‑space indent, semicolons, double quotes
- Backend style: PEP8 with 4‑space indent; use Pydantic models and raise HTTPException for domain errors

Further improvements (TODO)
- Server side user settings persistence endpoints (frontend best‑effort call exists, backend endpoint optional)
- Ensemble `GET /models/ensemble` to return consensus + per‑model breakdown (recommended)
- Backend prediction cache (short TTL) to dedupe repeated inference across users

Where to look first when debugging
- Market fetches: `backend/app/routers/market.py`
- Model loading & inference: `backend/app/services/model_registry.py`
- Frontend requests and caching: `frontend/src/shared/api/client.js`
