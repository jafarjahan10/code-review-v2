# Prisma setup

This project now includes a Prisma schema and the Prisma client. Quick notes and commands:

1) Install dependencies (already done if you ran the setup here):

```powershell
npm install
```

2) Ensure a Postgres DB is running and reachable at the `DATABASE_URL` in your `.env` (the repo includes `.env.example`). Example DB is provided via `docker-compose.yml`.

Start the example DB (if you use Docker Desktop):

```powershell
cp .env.example .env
docker compose up -d
```

3) Generate Prisma client (creates `node_modules/@prisma/client` bindings):

```powershell
npx prisma generate
```

4) Push the schema to the database (creates tables) or run migrations:

```powershell
npx prisma db push
# or
npx prisma migrate dev --name init
```

If `npx prisma db push` fails with `P1001: Can't reach database server`, make sure Docker is running and the Postgres service is up.

Version note: The repo added `prisma` as a devDependency. If you see a warning about mismatched versions between `prisma` and `@prisma/client`, update both to matching versions with:

```powershell
npm i --save-dev prisma@latest
npm i @prisma/client@latest
```
