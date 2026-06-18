"""Import side-effect module: pulls every model into the Base metadata.

Alembic's env.py imports this so autogenerate and the initial migration see
all tables. Import order does not matter to SQLAlchemy.
"""
from app.db.base_class import Base  # noqa: F401
from app.models.customer import Customer  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
from app.models.product import Product  # noqa: F401
