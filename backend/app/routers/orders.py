from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.order import OrderCreate, OrderOut
from app.services import orders as service

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    return service.list_orders(db)


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    return service.create_order(db, payload)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return service.get_order(db, order_id)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    service.delete_order(db, order_id)
