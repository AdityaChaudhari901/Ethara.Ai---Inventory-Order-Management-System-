from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.crud import customer as crud
from app.db.session import get_db
from app.schemas.customer import CustomerCreate, CustomerOut

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=list[CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    return crud.list_customers(db)


@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    return crud.create_customer(db, payload)


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return crud.get_customer(db, customer_id)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    crud.delete_customer(db, customer_id)
