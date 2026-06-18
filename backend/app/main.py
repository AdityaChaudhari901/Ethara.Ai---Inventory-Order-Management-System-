from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import customers, dashboard, orders, products

settings = get_settings()

app = FastAPI(
    title=settings.project_name,
    version=settings.api_version,
    description="REST API for managing products, customers, orders, and inventory.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}


@app.get("/", tags=["meta"])
def root():
    return {"service": settings.project_name, "version": settings.api_version, "docs": "/docs"}


app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)
