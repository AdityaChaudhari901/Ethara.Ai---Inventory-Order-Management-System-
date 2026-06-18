"""Test fixtures: an isolated in-memory sqlite database per test and a
TestClient wired to it. No PostgreSQL needed to run the suite."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Enforce foreign keys on sqlite so RESTRICT/CASCADE behave like Postgres.
    @event.listens_for(engine, "connect")
    def _fk_pragma(dbapi_conn, _):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()

    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ---- small helpers -------------------------------------------------------

def make_product(client, sku="SKU-1", name="Widget", price=10.0, qty=100):
    resp = client.post(
        "/products",
        json={"name": name, "sku": sku, "price": price, "quantity_in_stock": qty},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def make_customer(client, email="a@example.com", name="Alice", phone="123"):
    resp = client.post(
        "/customers",
        json={"full_name": name, "email": email, "phone": phone},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()
