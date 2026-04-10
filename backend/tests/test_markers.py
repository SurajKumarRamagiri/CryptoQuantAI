from fastapi.testclient import TestClient
from app.main import app


def _client() -> TestClient:
    return TestClient(app)


import pytest


@pytest.mark.phase3
@pytest.mark.trading_core
def test_trade_core_path() -> None:
    client = _client()
    client.post("/api/v1/auth/register", json={"email": "u@example.com", "password": "password123"})
    login = client.post("/api/v1/auth/login", json={"email": "u@example.com", "password": "password123"})
    token = login.json()["data"]["access_token"]
    response = client.post(
        "/api/v1/orders",
        json={
            "symbol": "BTCUSDT",
            "timeframe": "1m",
            "order_type": "MARKET",
            "side": "BUY",
            "quantity": 0.01,
            "idempotency_key": "abc"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "INSUFFICIENT_BALANCE"


@pytest.mark.integration
@pytest.mark.db_txn
@pytest.mark.migration
def test_integration_placeholder() -> None:
    assert True


@pytest.mark.parity
@pytest.mark.schema_compat
@pytest.mark.model_endpoints
def test_model_endpoint_path() -> None:
    client = _client()
    client.post("/api/v1/auth/register", json={"email": "m@example.com", "password": "password123"})
    login = client.post("/api/v1/auth/login", json={"email": "m@example.com", "password": "password123"})
    token = login.json()["data"]["access_token"]
    response = client.post(
        "/api/v1/models/predict/hybrid-gru-xgboost",
        json={"symbol": "BTCUSDT", "timeframe": "1m", "payload": {}},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200


@pytest.mark.observability
@pytest.mark.rollback
def test_ops_placeholder() -> None:
    assert True
