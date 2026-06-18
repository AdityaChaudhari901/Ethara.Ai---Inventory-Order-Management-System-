from tests.conftest import make_product


def test_create_and_get_product(client):
    created = make_product(client, sku="ABC-1")
    assert created["id"] > 0
    assert created["sku"] == "ABC-1"

    fetched = client.get(f"/products/{created['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["name"] == "Widget"


def test_duplicate_sku_rejected(client):
    make_product(client, sku="DUP-1")
    resp = client.post(
        "/products",
        json={"name": "Other", "sku": "DUP-1", "price": 5, "quantity_in_stock": 1},
    )
    assert resp.status_code == 409


def test_negative_quantity_rejected_by_validation(client):
    resp = client.post(
        "/products",
        json={"name": "Bad", "sku": "NEG-1", "price": 5, "quantity_in_stock": -1},
    )
    assert resp.status_code == 422


def test_negative_price_rejected_by_validation(client):
    resp = client.post(
        "/products",
        json={"name": "Bad", "sku": "NEGP-1", "price": -5, "quantity_in_stock": 1},
    )
    assert resp.status_code == 422


def test_update_product(client):
    p = make_product(client, sku="UPD-1", qty=10)
    resp = client.put(f"/products/{p['id']}", json={"quantity_in_stock": 50, "price": 12.5})
    assert resp.status_code == 200
    body = resp.json()
    assert body["quantity_in_stock"] == 50
    assert body["price"] == 12.5


def test_delete_product(client):
    p = make_product(client, sku="DEL-1")
    assert client.delete(f"/products/{p['id']}").status_code == 204
    assert client.get(f"/products/{p['id']}").status_code == 404


def test_get_missing_product_404(client):
    assert client.get("/products/999").status_code == 404
