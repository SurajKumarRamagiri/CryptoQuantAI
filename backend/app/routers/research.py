from fastapi import APIRouter, Depends
from app.schemas.common import ok
from app.routers.deps import current_user_id

router = APIRouter(prefix="/research", tags=["research"])


@router.get("/analysis")
def analysis(user_id: str = Depends(current_user_id)):
    return ok({
        "summary": "Hybrid model currently leads on Sharpe and drawdown stability.",
        "metrics": {"accuracy": 0.64, "rmse": 0.21, "mae": 0.17, "win_rate": 0.58, "sharpe": 1.21}
    })


@router.get("/summaries")
def summaries(user_id: str = Depends(current_user_id)):
    return ok([
        {"id": "1", "title": "BTC momentum regime", "decision": "WATCH", "confidence": 0.61},
        {"id": "2", "title": "ETH mean reversion window", "decision": "FOLLOW", "confidence": 0.66}
    ])


@router.get("/summaries/{summary_id}")
def summary(summary_id: str, user_id: str = Depends(current_user_id)):
    return ok({"id": summary_id, "title": "Detailed summary", "content": "Model confidence is probabilistic."})
