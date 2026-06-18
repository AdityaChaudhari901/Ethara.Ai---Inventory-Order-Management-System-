"""Order business logic.

This module owns the rules that make orders safe:
  * the referenced customer and products must exist
  * stock must be sufficient for every line
  * placing an order reduces stock atomically (one transaction)
  * the total is computed by the backend from current product prices
  * deleting an order returns its items to stock

Product rows are locked with SELECT ... FOR UPDATE so two concurrent orders
cannot both pass the stock check and oversell. (On sqlite the lock clause is a
no-op, which is fine for the test suite.)
"""
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


def list_orders(db: Session) -> list[Order]:
    return list(db.scalars(select(Order).order_by(Order.id.desc())).all())


def get_order(db: Session, order_id: int) -> Order:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found",
        )
    return order


def create_order(db: Session, payload: OrderCreate) -> Order:
    customer = db.get(Customer, payload.customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer {payload.customer_id} not found",
        )

    # Lock every referenced product row up front.
    product_ids = {item.product_id for item in payload.items}
    products = db.scalars(
        select(Product).where(Product.id.in_(product_ids)).with_for_update()
    ).all()
    products_by_id = {product.id: product for product in products}

    missing = product_ids - products_by_id.keys()
    if missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product(s) not found: {sorted(missing)}",
        )

    order = Order(customer_id=customer.id, status="PLACED", total_amount=Decimal("0"))
    total = Decimal("0")

    # Aggregate quantities so a product listed twice is validated against a
    # single running stock figure.
    requested: dict[int, int] = {}
    for item in payload.items:
        requested[item.product_id] = requested.get(item.product_id, 0) + item.quantity

    for product_id, qty in requested.items():
        product = products_by_id[product_id]
        if product.quantity_in_stock < qty:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Insufficient stock for '{product.name}' (SKU {product.sku}): "
                    f"requested {qty}, available {product.quantity_in_stock}"
                ),
            )

        unit_price = Decimal(product.price)
        line_total = unit_price * qty
        total += line_total
        product.quantity_in_stock -= qty
        order.items.append(
            OrderItem(
                product_id=product.id,
                quantity=qty,
                unit_price=unit_price,
                line_total=line_total,
            )
        )

    order.total_amount = total
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def delete_order(db: Session, order_id: int) -> None:
    """Cancel an order and return its items to stock."""
    order = get_order(db, order_id)
    for item in order.items:
        product = db.get(Product, item.product_id)
        if product is not None:
            product.quantity_in_stock += item.quantity
    db.delete(order)
    db.commit()
