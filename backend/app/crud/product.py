"""Product data-access. Raises HTTPException for client-facing error cases
so routers stay thin and consistent."""
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def list_products(db: Session) -> list[Product]:
    return list(db.scalars(select(Product).order_by(Product.id)).all())


def get_product(db: Session, product_id: int) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found",
        )
    return product


def create_product(db: Session, payload: ProductCreate) -> Product:
    product = Product(**payload.model_dump())
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A product with SKU '{payload.sku}' already exists",
        )
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, payload: ProductUpdate) -> Product:
    product = get_product(db, product_id)
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(product, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Another product already uses that SKU",
        )
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    try:
        db.delete(product)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a product that is referenced by existing orders",
        )
