# Stockroom — Inventory & Order Management System

A production-grade, fully containerized full-stack app for managing **products,
customers, orders, and inventory**. React frontend, FastAPI backend, PostgreSQL
database, orchestrated with Docker Compose and deployable to free hosting.

| Layer | Tech |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios |
| Backend | Python, FastAPI, SQLAlchemy, Alembic, Pydantic v2 |
| Database | PostgreSQL 16 |
| Infra | Docker (multi-stage, slim images), Docker Compose, nginx |

---

## Quick start (Docker Compose)

Requires Docker + Docker Compose.

```bash
cp .env.example .env        # adjust POSTGRES_PASSWORD etc.
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

The backend waits for Postgres to be healthy, runs migrations automatically, then
serves the API. PostgreSQL data persists in the named volume `pgdata`.

---

## Local development (without Docker)

**Backend**

```bash
cd backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
# Use sqlite for a zero-setup local DB:
export DATABASE_URL="sqlite:///./dev.db"
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173, proxies /api -> localhost:8000
```

---

## Project structure

```
.
├── backend/            FastAPI app (models, schemas, crud, services, routers)
│   ├── app/
│   ├── alembic/        database migrations
│   ├── tests/          pytest suite (business rules + API)
│   └── Dockerfile
├── frontend/           React + Vite + Tailwind SPA
│   ├── src/
│   ├── nginx.conf      serves the build, proxies /api to the backend
│   └── Dockerfile
├── docker-compose.yml  frontend + backend + db
├── render.yaml         backend + managed Postgres on Render
└── DEPLOYMENT.md       step-by-step cloud deployment guide
```

---

## API

Interactive docs at `/docs`. Summary:

| Method | Path | Purpose |
|---|---|---|
| `GET/POST` | `/products` | List / create products |
| `GET/PUT/DELETE` | `/products/{id}` | Read / update / delete a product |
| `GET/POST` | `/customers` | List / create customers |
| `GET/DELETE` | `/customers/{id}` | Read / delete a customer |
| `GET/POST` | `/orders` | List / create orders |
| `GET/DELETE` | `/orders/{id}` | Read / cancel an order (restores stock) |
| `GET` | `/dashboard/summary` | Totals + low-stock list |
| `GET` | `/health` | Health check |

### Order request example

```json
POST /orders
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

The backend validates stock, reduces it atomically, and computes `total_amount`
from current product prices — the client cannot set the total.

---

## Business rules enforced

- Product **SKU is unique**; customer **email is unique** (DB constraint → `409`).
- Product quantity **cannot go negative** (DB check + request validation).
- Orders are **rejected when stock is insufficient** (`409`).
- Placing an order **reduces stock atomically** in one transaction
  (`SELECT ... FOR UPDATE` prevents overselling under concurrency).
- **Total is computed by the backend**, never trusted from the client.
- Cancelling an order **returns its quantities to stock**.
- All endpoints validate input and return appropriate HTTP status codes.

---

## Tests

```bash
cd backend && . .venv/bin/activate
pytest -q
```

The suite runs on in-memory sqlite (no PostgreSQL needed) and covers every
business rule above plus CRUD and validation paths.

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deploying the backend to Render, the
frontend to Vercel, and the backend image to Docker Hub, including the full
environment-variable matrix.

## Configuration

All configuration is via environment variables (see `.env.example`,
`backend/` reads them through `app/core/config.py`, `frontend/.env.example`).
No credentials are hardcoded anywhere in the codebase.
