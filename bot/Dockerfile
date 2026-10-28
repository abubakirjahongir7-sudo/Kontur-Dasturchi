# Docker Hub ochilmasa, Dokploy'da build argument bering:
# PYTHON_IMAGE=mirror.gcr.io/library/python:3.13-slim
ARG PYTHON_IMAGE=python:3.13-slim
FROM ${PYTHON_IMAGE}

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    DB_PATH=/app/data/bot.db

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

# Profil, senariylar va tahlillar shu yerda — Dokploy'da volume ulang, aks holda har deployda o'chadi
VOLUME ["/app/data"]

CMD ["python", "main.py"]
