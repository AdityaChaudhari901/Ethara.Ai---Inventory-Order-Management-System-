# API Reference

Base URL (production): `https://inventory-api-lyf9.onrender.com`
Interactive Swagger UI: `/docs` · OpenAPI schema: `/openapi.json`

All requests and responses are JSON. Errors return `{ "detail": "<message>" }`
(or an array of field errors for validation failures).

### Status codes used

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `204` | No Content (successful delete) |
| `404` | Resource not found |
| `409` | Conflict (duplicate SKU/email, insufficient stock) |
| `422` | Validation error (bad/missing fields) |

---

## Products

### `GET /products`
List all products.
```json
[
  { "id": 1, "name": "Aluminium Tripod", "sku": "TRP-A100",
    "price": 89.99, "quantity_in_stock": 118,
    "created_at": "...", "updated_at": "..." }
]
```

### `POST /products` → `201`
```json
// request
{ "name": "Aluminium Tripod", "sku": "TRP-A100", "price": 89.99, "quantity_in_stock": 120 }
```
- `409` if the SKU already exists.
- `422` if `price < 0` or `quantity_in_stock < 0`.

### `GET /products/{id}`
Returns one product, or `404`.

### `PUT /products/{id}`
Partial update — send only the fields to change.
```json
{ "price": 79.99, "quantity_in_stock": 150 }
```
- `409` if changing the SKU to one that already exists. `404` if not found.

### `DELETE /products/{id}` → `204`
- `409` if the product is referenced by existing orders.

---

## Customers

### `GET /customers`
List all customers.

### `POST /customers` → `201`
```json
{ "full_name": "Maria Gomez", "email": "maria@example.com", "phone": "+1 555 0100" }
```
- `409` if the email already exists.
- `422` if the email is invalid.

### `GET /customers/{id}`
Returns one customer, or `404`.

### `DELETE /customers/{id}` → `204`
- `409` if the customer has existing orders.

---

## Orders

### `GET /orders`
List all orders (newest first), each with its line items.

### `POST /orders` → `201`
Creates an order, validates and reduces stock atomically, and computes the total.
```json
// request
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```
```json
// response
{
  "id": 1,
  "customer_id": 1,
  "total_amount": 243.98,
  "status": "PLACED",
  "created_at": "...",
  "items": [
    { "id": 1, "product_id": 1, "quantity": 2, "unit_price": 89.99, "line_total": 179.98 },
    { "id": 2, "product_id": 3, "quantity": 1, "unit_price": 64.00, "line_total": 64.00 }
  ]
}
```
- `404` if the customer or any product does not exist.
- `409` if any line exceeds available stock (with a message naming the product).
- `422` if `items` is empty or a quantity is `<= 0`.
- `total_amount` is **always computed by the server**; any value sent by the
  client is ignored.

### `GET /orders/{id}`
Returns one order with items, or `404`.

### `DELETE /orders/{id}` → `204`
Cancels the order and **returns its quantities to stock**.

---

## Dashboard

### `GET /dashboard/summary`
```json
{
  "total_products": 5,
  "total_customers": 2,
  "total_orders": 2,
  "low_stock_threshold": 10,
  "low_stock_count": 3,
  "low_stock_products": [ /* ProductOut[] at or below threshold */ ],
  "total_inventory_value": 21933.32
}
```

## Meta

### `GET /health`
```json
{ "status": "ok" }
```
