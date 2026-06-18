from tests.conftest import make_customer


def test_create_and_list_customer(client):
    make_customer(client, email="bob@example.com", name="Bob")
    resp = client.get("/customers")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_duplicate_email_rejected(client):
    make_customer(client, email="dupe@example.com")
    resp = client.post(
        "/customers",
        json={"full_name": "Another", "email": "dupe@example.com", "phone": "9876500000"},
    )
    assert resp.status_code == 409


def test_invalid_email_rejected(client):
    resp = client.post(
        "/customers",
        json={"full_name": "X", "email": "not-an-email", "phone": "9876500001"},
    )
    assert resp.status_code == 422


def test_phone_must_be_10_digits(client):
    # too short
    short = client.post(
        "/customers",
        json={"full_name": "Pat", "email": "pat@example.com", "phone": "12345"},
    )
    assert short.status_code == 422
    # too long
    long = client.post(
        "/customers",
        json={"full_name": "Pat", "email": "pat@example.com", "phone": "123456789012"},
    )
    assert long.status_code == 422
    # exactly 10 digits is accepted and stored as digits
    ok = client.post(
        "/customers",
        json={"full_name": "Pat", "email": "pat@example.com", "phone": "9876543210"},
    )
    assert ok.status_code == 201
    assert ok.json()["phone"] == "9876543210"


def test_phone_required(client):
    resp = client.post(
        "/customers",
        json={"full_name": "No Phone", "email": "nophone@example.com"},
    )
    assert resp.status_code == 422


def test_delete_customer(client):
    c = make_customer(client, email="gone@example.com")
    assert client.delete(f"/customers/{c['id']}").status_code == 204
    assert client.get(f"/customers/{c['id']}").status_code == 404
