from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.dashboard import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db)):
    settings = get_settings()
    threshold = settings.low_stock_threshold

    total_products = db.scalar(select(func.count()).select_from(Product)) or 0
    total_customers = db.scalar(select(func.count()).select_from(Customer)) or 0
    total_orders = db.scalar(select(func.count()).select_from(Order)) or 0

    low_stock = list(
        db.scalars(
            select(Product)
            .where(Product.quantity_in_stock <= threshold)
            .order_by(Product.quantity_in_stock)
        ).all()
    )

    inventory_value = (
        db.scalar(select(func.coalesce(func.sum(Product.price * Product.quantity_in_stock), 0)))
        or 0
    )

    return DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_threshold=threshold,
        low_stock_count=len(low_stock),
        low_stock_products=low_stock,
        total_inventory_value=float(inventory_value),
    )
