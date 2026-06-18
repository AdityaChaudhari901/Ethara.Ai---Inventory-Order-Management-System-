from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


def list_customers(db: Session) -> list[Customer]:
    return list(db.scalars(select(Customer).order_by(Customer.id)).all())


def get_customer(db: Session, customer_id: int) -> Customer:
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer {customer_id} not found",
        )
    return customer


def create_customer(db: Session, payload: CustomerCreate) -> Customer:
    customer = Customer(
        full_name=payload.full_name,
        email=str(payload.email),
        phone=payload.phone,
    )
    db.add(customer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A customer with email '{payload.email}' already exists",
        )
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = get_customer(db, customer_id)
    try:
        db.delete(customer)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a customer that has existing orders",
        )
