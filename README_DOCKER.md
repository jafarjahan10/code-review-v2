# Local PostgreSQL (Docker Compose)

This file explains how to start a local PostgreSQL database for development using the provided `docker-compose.yml`.

1) Copy the example env file to `.env` and edit if needed:

```powershell
cp .env.example .env
```

2) Start Postgres in background:

```powershell
docker compose up -d
```

3) Stop and remove containers and the persistent named volume (for a clean slate):

```powershell
docker compose down -v
```

Default example credentials (from `.env.example`):

- POSTGRES_USER=postgres
- POSTGRES_PASSWORD=postgres
- POSTGRES_DB=app_db

Example DATABASE_URL:

```
postgresql://postgres:postgres@localhost:5432/app_db
```

Notes:

- The compose file creates a named Docker volume `code_review_db_data` which keeps DB data across restarts. Remove it with `docker compose down -v`.
- If your app or ORM expects a different env variable (for example `DATABASE_URL` or `PGHOST`), update `.env` accordingly.
