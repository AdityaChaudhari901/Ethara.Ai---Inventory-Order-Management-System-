# ----- builder: install dependencies into a wheelhouse -----
FROM python:3.12-slim AS builder

WORKDIR /app
ENV PIP_NO_CACHE_DIR=1

COPY requirements.txt .
RUN pip wheel --wheel-dir /wheels -r requirements.txt

# ----- runtime: slim image, non-root, prebuilt wheels -----
FROM python:3.12-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Create an unprivileged user to run the app.
RUN useradd --create-home --uid 1000 appuser

WORKDIR /app

COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt \
    && rm -rf /wheels

COPY . .
RUN chmod +x entrypoint.sh && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Healthcheck hits the API's /health endpoint.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0) if urllib.request.urlopen('http://localhost:8000/health').status==200 else sys.exit(1)" || exit 1

CMD ["./entrypoint.sh"]
