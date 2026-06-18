from tests.conftest import make_customer, make_product


def test_create_order_reduces_stock_and_computes_total(client):
    customer = make_customer(client)
    product = make_product(client, sku="ORD-1", price=10.0, qty=100)

    resp = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 3}]},
    )
    assert resp.status_code == 201, resp.text
    order = resp.json()

    # Total computed by backend: 3 * 10.00 = 30.00
    assert order["total_amount"] == 30.0
    assert order["items"][0]["line_total"] == 30.0
    assert order["status"] == "PLACED"

    # Stock reduced 100 -> 97
    after = client.get(f"/products/{product['id']}").json()
    assert after["quantity_in_stock"] == 97


def test_order_rejected_when_insufficient_stock(client):
    customer = make_customer(client)
    product = make_product(client, sku="ORD-2", price=5.0, qty=2)

    resp = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 5}]},
    )
    assert resp.status_code == 409
    # Stock unchanged
    assert client.get(f"/products/{product['id']}").json()["quantity_in_stock"] == 2


def test_client_cannot_set_total(client):
    customer = make_customer(client)
    product = make_product(client, sku="ORD-3", price=7.0, qty=10)
    resp = client.post(
        "/orders",
        json={
            "customer_id": customer["id"],
            "total_amount": 0.01,  # ignored by the API
            "items": [{"product_id": product["id"], "quantity": 2}],
        },
    )
    assert resp.status_code == 201
    assert resp.json()["total_amount"] == 14.0


def test_multi_product_order_total(client):
    customer = make_customer(client)
    p1 = make_product(client, sku="MP-1", price=10.0, qty=10)
    p2 = make_product(client, sku="MP-2", price=2.5, qty=10)
    resp = client.post(
        "/orders",
        json={
            "customer_id": customer["id"],
            "items": [
                {"product_id": p1["id"], "quantity": 2},  # 20.00
                {"product_id": p2["id"], "quantity": 4},  # 10.00
            ],
        },
    )
    assert resp.status_code == 201
    assert resp.json()["total_amount"] == 30.0


def test_order_with_unknown_customer_404(client):
    product = make_product(client, sku="ORD-4")
    resp = client.post(
        "/orders",
        json={"customer_id": 999, "items": [{"product_id": product["id"], "quantity": 1}]},
    )
    assert resp.status_code == 404


def test_order_with_unknown_product_404(client):
    customer = make_customer(client)
    resp = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": 999, "quantity": 1}]},
    )
    assert resp.status_code == 404


def test_empty_order_rejected(client):
    customer = make_customer(client)
    resp = client.post("/orders", json={"customer_id": customer["id"], "items": []})
    assert resp.status_code == 422


def test_delete_order_restores_stock(client):
    customer = make_customer(client)
    product = make_product(client, sku="ORD-5", price=10.0, qty=10)
    order = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 4}]},
    ).json()
    assert client.get(f"/products/{product['id']}").json()["quantity_in_stock"] == 6

    assert client.delete(f"/orders/{order['id']}").status_code == 204
    # Stock restored 6 -> 10
    assert client.get(f"/products/{product['id']}").json()["quantity_in_stock"] == 10


def test_dashboard_summary(client):
    customer = make_customer(client)
    make_product(client, sku="LOW-1", price=1.0, qty=2)   # low stock
    make_product(client, sku="HIGH-1", price=1.0, qty=500)  # not low
    client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": 1, "quantity": 1}]},
    )

    summary = client.get("/dashboard/summary").json()
    assert summary["total_products"] == 2
    assert summary["total_customers"] == 1
    assert summary["total_orders"] == 1
    assert summary["low_stock_count"] == 1
    assert summary["low_stock_products"][0]["sku"] == "LOW-1"
