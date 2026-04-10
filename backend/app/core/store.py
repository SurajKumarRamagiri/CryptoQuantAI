from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

import httpx
from sqlalchemy import (
    DateTime,
    Float,
    Integer,
    String,
    create_engine,
    func,
    inspect,
    select,
    text,
)
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

from app.core.config import settings


class Base(DeclarativeBase):
    pass


BINANCE_API_BASE = "https://api.binance.com"
SUPPORTED_SYMBOLS = ["BTCUSDT", "ETHUSDT", "LTCUSDT"]


def _fetch_price_from_binance(symbol: str) -> float | None:
    try:
        with httpx.Client(base_url=BINANCE_API_BASE, timeout=5.0) as client:
            response = client.get(
                "/api/v3/ticker/price", params={"symbol": symbol.upper()}
            )
            if response.status_code == 200:
                return float(response.json()["price"])
    except Exception:
        pass
    return None


_price_cache: dict[str, float] = {}
_price_cache_time: datetime | None = None


def _get_cached_price(symbol: str) -> float:
    global _price_cache, _price_cache_time
    now = datetime.now(timezone.utc)

    if (
        _price_cache_time
        and (now - _price_cache_time).total_seconds() < 5
        and symbol in _price_cache
    ):
        return _price_cache[symbol]

    price = _fetch_price_from_binance(symbol)
    if price is not None:
        _price_cache[symbol] = price
        _price_cache_time = now
        return price

    fallback = {"BTCUSDT": 62000.0, "ETHUSDT": 3200.0, "LTCUSDT": 90.0}
    return fallback.get(symbol, 100.0)


class UserAccount(Base):
    __tablename__ = "user_account"

    user_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    email: Mapped[str] = mapped_column(
        String(320), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    display_name: Mapped[str] = mapped_column(
        String(128), nullable=False, default="Trader"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class Portfolio(Base):
    __tablename__ = "portfolio"

    user_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    cash_balance: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    equity_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    realized_pnl: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    unrealized_pnl: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class PortfolioHolding(Base):
    __tablename__ = "portfolio_holding"

    user_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    symbol: Mapped[str] = mapped_column(String(24), primary_key=True)
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)


class PaperOrder(Base):
    __tablename__ = "paper_order"

    order_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    symbol: Mapped[str] = mapped_column(String(24), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    side: Mapped[str] = mapped_column(String(16), nullable=False)
    order_type: Mapped[str] = mapped_column(String(24), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    executed_price: Mapped[float] = mapped_column(Float, nullable=False)
    fees: Mapped[float] = mapped_column(Float, nullable=False)
    slippage_bps: Mapped[int] = mapped_column(Integer, nullable=False)
    client_order_id: Mapped[str] = mapped_column(
        String(128), nullable=False, index=True
    )
    parent_order_id: Mapped[str | None] = mapped_column(
        String(128), nullable=True, index=True
    )
    trigger_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    trace_id: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )


class CreditLedger(Base):
    __tablename__ = "credit_ledger"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    reason: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class PersistentStore:
    def __init__(self) -> None:
        self.engine = create_engine(
            self._resolve_database_url(), future=True, pool_pre_ping=True
        )
        Base.metadata.create_all(self.engine)
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        inspector = inspect(self.engine)
        if not inspector.has_table("paper_order"):
            return

        existing = {column["name"] for column in inspector.get_columns("paper_order")}
        required: dict[str, str] = {
            "client_order_id": "TEXT",
            "parent_order_id": "TEXT",
            "trigger_price": "FLOAT",
        }

        with self.engine.begin() as conn:
            for column_name, column_type in required.items():
                if column_name in existing:
                    continue
                conn.execute(
                    text(
                        f"ALTER TABLE paper_order ADD COLUMN {column_name} {column_type}"
                    )
                )

            if "client_order_id" in required and "client_order_id" not in existing:
                conn.execute(
                    text(
                        "UPDATE paper_order SET client_order_id = order_id WHERE client_order_id IS NULL"
                    )
                )

    @staticmethod
    def _resolve_database_url() -> str:
        configured = (settings.db_url or "").strip()
        if not configured:
            raise RuntimeError(
                "DATABASE_URL is required and must point to Supabase PostgreSQL"
            )

        normalized = configured.lower()
        if "supabase.com" not in normalized or not normalized.startswith("postgresql"):
            raise RuntimeError(
                "DATABASE_URL must be a Supabase PostgreSQL connection string"
            )

        try:
            probe_engine = create_engine(configured, future=True, pool_pre_ping=True)
            with probe_engine.connect() as conn:
                conn.execute(select(1))
            return configured
        except SQLAlchemyError as exc:
            raise RuntimeError(
                "Failed to connect to Supabase PostgreSQL using DATABASE_URL"
            ) from exc

    @staticmethod
    def _derive_display_name(email: str) -> str:
        local = email.split("@")[0] if "@" in email else email
        cleaned = " ".join(
            piece
            for piece in local.replace(".", " ").replace("_", " ").split()
            if piece
        )
        if not cleaned:
            return "Trader"
        return " ".join(word.capitalize() for word in cleaned.split())

    def create_user(
        self, email: str, password_hash: str, display_name: str | None = None
    ) -> dict:
        user_id = email
        resolved_display_name = display_name or self._derive_display_name(email)
        payload = UserAccount(
            user_id=user_id,
            email=email,
            password_hash=password_hash,
            display_name=resolved_display_name,
        )
        with Session(self.engine) as session:
            session.add(payload)
            try:
                session.commit()
            except IntegrityError as exc:
                session.rollback()
                raise ValueError("EMAIL_EXISTS") from exc
            self.ensure_user_portfolio(user_id)
        return {
            "id": user_id,
            "email": email,
            "password_hash": password_hash,
            "display_name": resolved_display_name,
        }

    def get_user_by_email(self, email: str) -> dict | None:
        with Session(self.engine) as session:
            user = session.get(UserAccount, email)
            if not user:
                return None
            return {
                "id": user.user_id,
                "email": user.email,
                "password_hash": user.password_hash,
                "display_name": user.display_name,
            }

    def ensure_user_portfolio(self, user_id: str) -> None:
        with Session(self.engine) as session:
            portfolio = session.get(Portfolio, user_id)
            if portfolio is None:
                session.add(
                    Portfolio(
                        user_id=user_id,
                        cash_balance=0.0,
                        equity_value=0.0,
                        realized_pnl=0.0,
                        unrealized_pnl=0.0,
                        updated_at=datetime.now(timezone.utc),
                    )
                )
                session.commit()

    def get_portfolio(self, user_id: str) -> dict:
        self.ensure_user_portfolio(user_id)
        with Session(self.engine) as session:
            portfolio = session.get(Portfolio, user_id)
            holdings = session.scalars(
                select(PortfolioHolding).where(PortfolioHolding.user_id == user_id)
            ).all()
            return {
                "cash_balance": float(portfolio.cash_balance if portfolio else 0.0),
                "equity_value": float(portfolio.equity_value if portfolio else 0.0),
                "realized_pnl": float(portfolio.realized_pnl if portfolio else 0.0),
                "unrealized_pnl": float(portfolio.unrealized_pnl if portfolio else 0.0),
                "holdings": {
                    holding.symbol: float(holding.quantity) for holding in holdings
                },
            }

    def get_holdings(self, user_id: str) -> dict[str, float]:
        with Session(self.engine) as session:
            holdings = session.scalars(
                select(PortfolioHolding).where(PortfolioHolding.user_id == user_id)
            ).all()
            return {holding.symbol: float(holding.quantity) for holding in holdings}

    def list_orders(self, user_id: str) -> list[dict]:
        with Session(self.engine) as session:
            orders = session.scalars(
                select(PaperOrder)
                .where(PaperOrder.user_id == user_id)
                .order_by(PaperOrder.created_at.desc())
            ).all()
            return [self._serialize_order(order) for order in orders]

    def _get_or_create_holding(
        self, session: Session, user_id: str, symbol: str
    ) -> PortfolioHolding:
        holding = session.get(PortfolioHolding, {"user_id": user_id, "symbol": symbol})
        if holding is None:
            holding = PortfolioHolding(user_id=user_id, symbol=symbol, quantity=0.0)
            session.add(holding)
            session.flush()
        return holding

    @staticmethod
    def _price_for_symbol(symbol: str) -> float:
        return _get_cached_price(symbol)

    @staticmethod
    def _build_client_order_id(candidate: str | None) -> str:
        if candidate and candidate.strip():
            return candidate.strip()
        return f"df-{uuid4().hex[:14]}"

    def _serialize_order(self, order: PaperOrder) -> dict:
        return {
            "order_id": order.order_id,
            "client_order_id": order.client_order_id or order.order_id,
            "parent_order_id": order.parent_order_id,
            "user_id": order.user_id,
            "symbol": order.symbol,
            "status": order.status,
            "side": order.side,
            "order_type": order.order_type,
            "quantity": float(order.quantity),
            "executed_price": float(order.executed_price),
            "fees": float(order.fees),
            "slippage_bps": int(order.slippage_bps),
            "trigger_price": float(order.trigger_price)
            if order.trigger_price is not None
            else None,
            "trace_id": order.trace_id,
            "created_at": order.created_at.isoformat(),
        }

    def _recalculate_equity(
        self, session: Session, user_id: str, portfolio: Portfolio
    ) -> None:
        all_holdings = session.scalars(
            select(PortfolioHolding).where(PortfolioHolding.user_id == user_id)
        ).all()
        holdings_value = sum(
            float(h.quantity) * self._price_for_symbol(h.symbol) for h in all_holdings
        )
        portfolio.equity_value = float(portfolio.cash_balance) + holdings_value
        portfolio.updated_at = datetime.now(timezone.utc)

    def _attach_protection_orders(
        self,
        session: Session,
        user_id: str,
        symbol: str,
        entry_side: str,
        quantity: float,
        parent_order_id: str,
        take_profit_price: float | None,
        stop_loss_price: float | None,
    ) -> list[str]:
        attached: list[str] = []
        protection_side = "SELL" if entry_side == "BUY" else "BUY"

        if take_profit_price is not None:
            tp_order = PaperOrder(
                order_id=str(uuid4()),
                client_order_id=self._build_client_order_id(None),
                parent_order_id=parent_order_id,
                user_id=user_id,
                symbol=symbol,
                status="NEW",
                side=protection_side,
                order_type="TAKE_PROFIT",
                quantity=quantity,
                executed_price=0.0,
                fees=0.0,
                slippage_bps=0,
                trigger_price=take_profit_price,
                trace_id=str(uuid4()),
                created_at=datetime.now(timezone.utc),
            )
            session.add(tp_order)
            attached.append(tp_order.order_id)

        if stop_loss_price is not None:
            sl_order = PaperOrder(
                order_id=str(uuid4()),
                client_order_id=self._build_client_order_id(None),
                parent_order_id=parent_order_id,
                user_id=user_id,
                symbol=symbol,
                status="NEW",
                side=protection_side,
                order_type="STOP_LOSS",
                quantity=quantity,
                executed_price=0.0,
                fees=0.0,
                slippage_bps=0,
                trigger_price=stop_loss_price,
                trace_id=str(uuid4()),
                created_at=datetime.now(timezone.utc),
            )
            session.add(sl_order)
            attached.append(sl_order.order_id)

        return attached

    def place_order(self, user_id: str, payload: dict) -> dict:
        self.ensure_user_portfolio(user_id)
        with Session(self.engine) as session:
            portfolio = session.get(Portfolio, user_id)
            if portfolio is None:
                raise ValueError("PORTFOLIO_NOT_FOUND")

            order_type = str(payload.get("order_type") or "MARKET").upper()
            if order_type != "MARKET":
                raise ValueError("UNSUPPORTED_ORDER_TYPE")

            order_id = str(uuid4())
            client_order_id = self._build_client_order_id(
                payload.get("new_client_order_id")
            )
            symbol = payload["symbol"]
            executed_price = self._price_for_symbol(symbol)
            quote_order_qty_raw = payload.get("quote_order_qty")
            quantity_raw = payload.get("quantity")
            qty_val = quantity_raw
            qty = (
                float(qty_val)
                if qty_val is not None
                else float(quote_order_qty_raw or 0) / executed_price
            )
            quote_order_qty_raw_val = quote_order_qty_raw
            quote_order_qty = (
                float(quote_order_qty_raw_val)
                if quote_order_qty_raw_val is not None
                else executed_price * qty
            )
            fee = executed_price * qty * 0.001
            total = executed_price * qty
            side = str(payload["side"]).upper()
            take_profit_price = payload.get("take_profit_price")
            stop_loss_price = payload.get("stop_loss_price")

            holding = self._get_or_create_holding(session, user_id, symbol)

            if side == "BUY":
                if float(portfolio.cash_balance) < quote_order_qty + fee:
                    raise ValueError("INSUFFICIENT_BALANCE")
                portfolio.cash_balance = (
                    float(portfolio.cash_balance) - quote_order_qty - fee
                )
                holding.quantity = float(holding.quantity) + qty
            else:
                if float(holding.quantity) < qty:
                    raise ValueError("INSUFFICIENT_ASSET")
                holding.quantity = float(holding.quantity) - qty
                portfolio.cash_balance = float(portfolio.cash_balance) + total - fee

            self._recalculate_equity(session, user_id, portfolio)

            order = PaperOrder(
                order_id=order_id,
                client_order_id=client_order_id,
                parent_order_id=None,
                user_id=user_id,
                symbol=symbol,
                status="FILLED",
                side=side,
                order_type=order_type,
                quantity=qty,
                executed_price=executed_price,
                fees=round(fee, 6),
                slippage_bps=2,
                trigger_price=None,
                trace_id=str(uuid4()),
                created_at=datetime.now(timezone.utc),
            )
            session.add(order)

            attached_order_ids = self._attach_protection_orders(
                session=session,
                user_id=user_id,
                symbol=symbol,
                entry_side=side,
                quantity=qty,
                parent_order_id=order_id,
                take_profit_price=float(take_profit_price)
                if take_profit_price is not None
                else None,
                stop_loss_price=float(stop_loss_price)
                if stop_loss_price is not None
                else None,
            )

            session.commit()

            return {
                **self._serialize_order(order),
                "quote_order_qty": round(quote_order_qty, 6),
                "entry_price": executed_price,
                "contingent_order_ids": attached_order_ids,
                "execution_mode": "paper",
                "provider": "binance_spot_compatible",
            }

    def cancel_order(self, user_id: str, order_id: str) -> dict | None:
        with Session(self.engine) as session:
            order = session.get(PaperOrder, order_id)
            if order is None or order.user_id != user_id:
                return None
            if order.status not in {"NEW", "PARTIALLY_FILLED"}:
                raise ValueError("ORDER_NOT_CANCELABLE")
            order.status = "CANCELED"
            session.commit()
            return self._serialize_order(order)

    def list_open_orders(self, user_id: str, symbol: str | None = None) -> list[dict]:
        with Session(self.engine) as session:
            stmt = select(PaperOrder).where(
                PaperOrder.user_id == user_id,
                PaperOrder.status.in_(["NEW", "PARTIALLY_FILLED"]),
            )
            if symbol:
                stmt = stmt.where(PaperOrder.symbol == symbol)
            orders = session.scalars(stmt.order_by(PaperOrder.created_at.desc())).all()
            return [self._serialize_order(order) for order in orders]

    def reset_funds(self, user_id: str) -> dict:
        self.ensure_user_portfolio(user_id)
        with Session(self.engine) as session:
            portfolio = session.get(Portfolio, user_id)
            if portfolio is None:
                return {"message": "Portfolio not found"}
            portfolio.cash_balance = 0.0
            portfolio.equity_value = 0.0
            portfolio.realized_pnl = 0.0
            portfolio.unrealized_pnl = 0.0
            session.query(PortfolioHolding).filter(
                PortfolioHolding.user_id == user_id
            ).delete()
            session.commit()
            return {"message": "Funds reset to 0 USDT"}

    def collect_credits(self, user_id: str, amount: float = 5000.0) -> dict:
        self.ensure_user_portfolio(user_id)
        with Session(self.engine) as session:
            portfolio = session.get(Portfolio, user_id)
            if portfolio is None:
                raise ValueError("PORTFOLIO_NOT_FOUND")

            if float(portfolio.cash_balance) > 0:
                raise ValueError("CREDITS_ALREADY_AVAILABLE")

            portfolio.cash_balance = float(portfolio.cash_balance) + amount
            portfolio.equity_value = float(portfolio.equity_value) + amount
            portfolio.updated_at = datetime.now(timezone.utc)
            session.add(
                CreditLedger(user_id=user_id, amount=amount, reason="manual_collect")
            )
            session.commit()
            return {
                "amount": amount,
                "cash_balance": float(portfolio.cash_balance),
                "equity_value": float(portfolio.equity_value),
            }

    def get_updates(self, user_id: str) -> list[dict]:
        portfolio = self.get_portfolio(user_id)
        with Session(self.engine) as session:
            order_count = int(
                session.scalar(
                    select(func.count(PaperOrder.order_id)).where(
                        PaperOrder.user_id == user_id
                    )
                )
                or 0
            )

        updates: list[dict] = []

        if portfolio["cash_balance"] <= 0:
            updates.append(
                {
                    "type": "action_required",
                    "title": "Collect Trading Credits",
                    "description": "Your credits are 0. Go to Trade and collect credits to start paper trading.",
                    "cta": {"label": "Go to Trade", "path": "/trade"},
                }
            )
        else:
            updates.append(
                {
                    "type": "info",
                    "title": "Credits Available",
                    "description": f"You have {portfolio['cash_balance']:.2f} credits ready for trading simulations.",
                }
            )

        if order_count == 0:
            updates.append(
                {
                    "type": "next_step",
                    "title": "Place Your First Trade",
                    "description": "Start with a small position and review model confidence before confirming.",
                    "cta": {"label": "Open Trade Ticket", "path": "/trade"},
                }
            )
        else:
            updates.append(
                {
                    "type": "next_step",
                    "title": "Review Portfolio Performance",
                    "description": "Analyze your realized and unrealized PnL to improve strategy discipline.",
                    "cta": {"label": "View Portfolio", "path": "/portfolio"},
                }
            )

        return updates


store = PersistentStore()
