# Deployment Guide

This project deploys as two pieces on free tiers:

- **Backend** (FastAPI + PostgreSQL) → **Render**
- **Frontend** (React static build) → **Vercel**
- **Backend image** → **Docker Hub**

Everything is configured through environment variables — no credentials are
committed. Follow the steps in order; each one notes exactly what to copy where.

> You run these steps with your own accounts. The repo already contains every
> config file referenced below (`render.yaml`, `frontend/vercel.json`,
> Dockerfiles, `docker-compose.yml`).

---

## Environment variable matrix

| Variable | Where | Value |
|---|---|---|
| `DATABASE_URL` | Render backend | Auto-injected from the managed Postgres (the app rewrites the driver automatically) |
| `CORS_ORIGINS` | Render backend | Your Vercel URL, e.g. `https://inventory-xyz.vercel.app` |
| `LOW_STOCK_THRESHOLD` | Render backend | `10` (optional) |
| `VITE_API_URL` | Vercel frontend | Your Render URL, e.g. `https://inventory-api.onrender.com` |

---

## 1. Push to GitHub

```bash
git remote add origin https://github.com/<you>/inventory-order-management.git
git push -u origin main
```

---

## 2. Backend → Render

**Option A — Blueprint (uses `render.yaml`, recommended):**

1. Edit `render.yaml` and set the `repo:` field to your GitHub URL, commit & push.
2. Render dashboard → **New** → **Blueprint** → pick your repo.
3. Render reads `render.yaml`, creating the `inventory-api` web service **and**
   the free `inventory-db` PostgreSQL instance, wiring `DATABASE_URL` for you.
4. After the first deploy, copy the service URL (e.g.
   `https://inventory-api.onrender.com`). Visit `/health` → should return
   `{"status":"ok"}`, and `/docs` for the Swagger UI.

**Option B — Manual:**

1. Render → **New** → **PostgreSQL** (free). Note the **Internal Database URL**.
2. Render → **New** → **Web Service** → your repo → **Docker** runtime.
   - Dockerfile path: `backend/Dockerfile`, context: `backend`.
   - Health check path: `/health`.
3. Add env vars: `DATABASE_URL` = the Internal Database URL, `CORS_ORIGINS` = `*`
   for now (tighten in step 4), `LOW_STOCK_THRESHOLD` = `10`.

Migrations run automatically on container start (`alembic upgrade head` in
`entrypoint.sh`), so the schema is created on first boot.

> Free Render services sleep when idle; the first request after a nap takes
> ~30s to wake. That's expected on the free tier.

---

## 3. Frontend → Vercel

1. Vercel → **Add New** → **Project** → import your repo.
2. Set **Root Directory** to `frontend`. Vercel auto-detects Vite
   (build `npm run build`, output `dist`; `vercel.json` also pins this and adds
   the SPA rewrite).
3. Add an environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g.
     `https://inventory-api.onrender.com`) — **no trailing slash**.
4. Deploy. Copy the resulting URL (e.g. `https://inventory-xyz.vercel.app`).

---

## 4. Connect the two (CORS)

1. Back in Render → `inventory-api` → **Environment**, set
   `CORS_ORIGINS` = your Vercel URL (e.g. `https://inventory-xyz.vercel.app`).
   Multiple origins can be comma-separated.
2. Save → Render redeploys. The frontend and backend now talk to each other.

Open the Vercel URL, add a product, create an order — it should hit the live API.

---

## 5. Backend image → Docker Hub

```bash
# from the repo root
docker build -t <dockerhub-username>/inventory-api:latest ./backend
docker login
docker push <dockerhub-username>/inventory-api:latest
```

Your image link: `https://hub.docker.com/r/<dockerhub-username>/inventory-api`

---

## Submission checklist

- [ ] GitHub repo URL (frontend + backend)
- [ ] Docker Hub image link for the backend
- [ ] Live frontend URL (Vercel)
- [ ] Live backend URL (Render) — verify `/health` and `/docs`
- [ ] `CORS_ORIGINS` set to the frontend URL; `VITE_API_URL` set to the backend URL
