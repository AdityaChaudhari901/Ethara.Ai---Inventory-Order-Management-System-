"""Seed demo data via the API, then screenshot every page to verify the UI.

Run via the webapp-testing helper which boots backend + frontend first.
"""
import time

import httpx
from playwright.sync_api import sync_playwright

API = "http://localhost:8000"
WEB = "http://localhost:5173"
OUT = "/tmp/ui"

PRODUCTS = [
    {"name": "Aluminium Tripod", "sku": "TRP-A100", "price": 89.99, "quantity_in_stock": 120},
    {"name": "Studio LED Panel", "sku": "LED-S22", "price": 149.50, "quantity_in_stock": 8},
    {"name": "Carbon Boom Arm", "sku": "BME-C7", "price": 64.00, "quantity_in_stock": 3},
    {"name": "Lens Cleaning Kit", "sku": "CLN-09", "price": 19.95, "quantity_in_stock": 0},
    {"name": "Shotgun Microphone", "sku": "MIC-SG1", "price": 229.00, "quantity_in_stock": 45},
]
CUSTOMERS = [
    {"full_name": "Maria Gomez", "email": "maria@brightfilms.com", "phone": "+1 555 0142"},
    {"full_name": "Devon Park", "email": "devon@parkstudio.io", "phone": "+1 555 0199"},
]


def seed():
    with httpx.Client(base_url=API, timeout=10) as c:
        ids = {}
        for p in PRODUCTS:
            r = c.post("/products", json=p)
            if r.status_code == 201:
                ids[p["sku"]] = r.json()["id"]
        cust_ids = []
        for cust in CUSTOMERS:
            r = c.post("/customers", json=cust)
            if r.status_code == 201:
                cust_ids.append(r.json()["id"])
        if cust_ids and ids:
            c.post(
                "/orders",
                json={
                    "customer_id": cust_ids[0],
                    "items": [
                        {"product_id": ids["TRP-A100"], "quantity": 2},
                        {"product_id": ids["MIC-SG1"], "quantity": 1},
                    ],
                },
            )
            c.post(
                "/orders",
                json={
                    "customer_id": cust_ids[-1],
                    "items": [{"product_id": ids["LED-S22"], "quantity": 1}],
                },
            )


def shoot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Desktop
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        for path, name in [
            ("/", "dashboard"),
            ("/products", "products"),
            ("/customers", "customers"),
            ("/orders", "orders"),
            ("/orders/1", "order-detail"),
        ]:
            page.goto(WEB + path)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(400)
            page.screenshot(path=f"{OUT}/{name}.png", full_page=True)

        # New-order modal — fill it so the live total + line layout show.
        page.goto(WEB + "/orders")
        page.wait_for_load_state("networkidle")
        page.get_by_text("New order").first.click()
        page.wait_for_timeout(500)
        selects = page.locator("select")
        selects.nth(0).select_option(index=1)  # customer
        selects.nth(1).select_option(index=1)  # product line
        page.locator('input[aria-label="Quantity"]').first.fill("2")
        page.wait_for_timeout(400)
        page.screenshot(path=f"{OUT}/order-modal.png", full_page=True)

        # Mobile dashboard
        m = browser.new_page(viewport={"width": 390, "height": 844})
        m.goto(WEB + "/")
        m.wait_for_load_state("networkidle")
        m.wait_for_timeout(400)
        m.screenshot(path=f"{OUT}/mobile-dashboard.png", full_page=True)

        browser.close()


if __name__ == "__main__":
    import os

    os.makedirs(OUT, exist_ok=True)
    # Give servers a beat to be fully ready.
    time.sleep(1)
    seed()
    shoot()
    print("UI verification screenshots written to", OUT)
