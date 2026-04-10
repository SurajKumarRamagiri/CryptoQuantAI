from pydantic import BaseModel, Field, model_validator


class OrderRequest(BaseModel):
    symbol: str
    timeframe: str = "1m"
    order_type: str = "MARKET"
    side: str
    quantity: float | None = Field(default=None, gt=0)
    quote_order_qty: float | None = Field(default=None, gt=0)
    model_name: str | None = None
    idempotency_key: str
    new_client_order_id: str | None = None
    time_in_force: str = "GTC"
    take_profit_price: float | None = Field(default=None, gt=0)
    stop_loss_price: float | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def validate_market_quantity(self) -> "OrderRequest":
        if self.order_type.upper() == "MARKET":
            if self.quantity is None and self.quote_order_qty is None:
                raise ValueError("quantity or quote_order_qty is required for MARKET")
        if self.take_profit_price is not None and self.stop_loss_price is not None:
            if self.side.upper() == "BUY" and self.take_profit_price <= self.stop_loss_price:
                raise ValueError("take_profit_price must be greater than stop_loss_price for BUY")
            if self.side.upper() == "SELL" and self.stop_loss_price <= self.take_profit_price:
                raise ValueError("stop_loss_price must be greater than take_profit_price for SELL")
        return self
