# Flower Shop Backend (FastAPI)

Production-ready backend for bouquet inventory and sales accounting.

## Stack

- Python 3.11+
- FastAPI
- PostgreSQL
- SQLAlchemy 2.0 (async)
- Alembic
- Pydantic v2
- JWT auth
- Docker + docker-compose

## Features

- JWT authorization with roles:
  - `admin`: full access
  - `employee`: can manage flowers (except delete) and create sales
- Inventory management for flowers
- Transactional bouquet sales with `SELECT ... FOR UPDATE`
- Decimal-only financial calculations
- Aggregated reports (`SUM`, `COUNT`) by period/date range
- Pagination on list endpoints
- Seed data: admin user + demo flowers

## Environment

Copy `.env.example` to `.env` and adjust values.

Required variables:

- `DATABASE_URL`
- `JWT_SECRET_KEY`

## Run with Docker

```bash
docker compose up --build
```

The API will be available at:

- http://localhost:8000
- Swagger: http://localhost:8000/docs

## Default seed credentials

- Email: `admin@flowers.local`
- Password: `Admin12345!`

## API Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Flowers

- `GET /flowers`
- `POST /flowers`
- `PUT /flowers/{id}`
- `DELETE /flowers/{id}` (admin only)

### Bouquets

- `POST /bouquets`
- `GET /bouquets`

### Reports

- `GET /reports`

Query options:

- `period=today`
- `period=this_week`
- `period=last_week`
- `period=this_month`
- `from=YYYY-MM-DD&to=YYYY-MM-DD`

## Local run (without Docker)

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run migrations:
   ```bash
   alembic upgrade head
   ```
3. Seed data:
   ```bash
   python -m app.db.seed
   ```
4. Start API:
   ```bash
   uvicorn app.main:app --reload
   ```
