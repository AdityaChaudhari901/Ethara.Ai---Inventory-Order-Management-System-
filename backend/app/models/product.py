from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("quantity_in_stock >= 0", name="ck_products_qty_nonneg"),
        CheckConstraint("price >= 0", name="ck_products_price_nonneg"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    quantity_in_stock: Mapped[int] = mapped_column(nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
