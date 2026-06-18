# Design: Containerized Inventory & Order Management System

**Date:** 2026-06-18
**Status:** Approved

## Objective

Full-stack Inventory & Order Management System: manage Products, Customers, Orders,
and Inventory tracking. React frontend + FastAPI backend + PostgreSQL, fully
containerized with Docker Compose, deployable on free hosting.

## Stack

- Backend: Python 3.12, FastAPI, SQLAlchemy, Alembic, uvicorn, Pydantic v2
- Frontend: React (Vite), Tailwind CSS, react-router, axios
- Database: PostgreSQL 16
- Containerization: Docker (multi-stage, slim images), Docker Compose

## Architecture

Three Compose services:

- `frontend` — Vite/React build served by nginx:alpine; proxies `/api` to backend
- `backend` — FastAPI on uvicorn (python:3.12-slim, non-root)
- `db` — postgres:16-alpine, named volume `pgdata`, credentials via env only

## Backend layout

```
backend/app/
  main.py            # app, CORS, routers, /health, startup migrations
  core/config.py     # Pydantic Settings from env
  db/session.py      # engine, SessionLocal, get_db
  db/base.py         # Base + model registry for Alembic
  models/            # product, customer, order, order_item
  schemas/           # Pydantic request/response per entity
  crud/              # DB access per entity
  routers/           # products, customers, orders, dashboard
  services/orders.py # order business logic (stock, totals, atomicity)
```

## Data model

- products: id, name, sku UNIQUE, price Numeric(>=0), quantity_in_stock Int CHECK(>=0), timestamps
- customers: id, full_name, email UNIQUE, phone, timestamps
- orders: id, customer_id FK, total_amount Numeric (server-computed), status, created_at
- order_items: id, order_id FK, product_id FK, quantity, unit_price (snapshot), line_total

Order has many order_items (supports multiple products per order).

## API

- Products: POST/GET list/GET id/PUT id/DELETE id
- Customers: POST/GET list/GET id/DELETE id
- Orders: POST/GET list/GET id/DELETE id
- GET /health, GET /dashboard/summary, Swagger /docs

## Business rules

- Unique SKU and unique email: DB unique constraint -> 409 on conflict
- quantity_in_stock never negative: DB CHECK + Pydantic ge=0
- Reject order when stock insufficient: 409 with message
- Order placement reduces stock atomically (single transaction, SELECT ... FOR UPDATE)
- total_amount computed by backend (sum unit_price*qty); client cannot set it
- DELETE /orders/{id} restores stock (cancel returns inventory)
- All endpoints: request validation + appropriate HTTP status codes

## Frontend

Vite + React + Tailwind + react-router + axios.
Pages: Dashboard (totals + low-stock), Products (CRUD), Customers (list/add/delete),
Orders (list, create with line items + live total, detail view).
Responsive, client-side validation, success/error toasts, reusable components.

## Containerization & config

- backend/Dockerfile (multi-stage, non-root, slim), frontend/Dockerfile (node build -> nginx)
- .dockerignore per service, root docker-compose.yml with healthchecks + depends_on
- .env.example documents all vars; no hardcoded credentials; named volume pgdata
- Backend runs Alembic migrations on startup, waits for healthy DB

## Deployment artifacts

- render.yaml (backend + managed Postgres)
- Vercel config + env for frontend
- Docker Hub push instructions
- DEPLOYMENT.md step-by-step guide + env var matrix

## Testing & verification

- pytest covering each business rule (unique, insufficient stock, stock reduction, total calc)
- Local: frontend build + backend boot + test suite. (Docker compose verified by the user
  on a machine with Docker installed.)
