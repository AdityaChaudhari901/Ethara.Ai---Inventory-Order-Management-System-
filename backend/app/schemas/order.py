from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: float
    line_total: float


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: list[OrderItemOut]
