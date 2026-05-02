# Attendfy

Smart Attendance Tracking System.

## Project Structure

- `src/`: Backend API (Node.js + Express + MySQL)
- `frontend/`: Frontend web app (React + Vite + TypeScript)
- `database/schema/`: SQL schema files
- `scripts/`: Seed/migration scripts for local development

## Prerequisites

- Node.js (LTS recommended)
- MySQL

## Environment Variables

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Update values in `.env` (do not commit this file).

Key variables:

- `PORT`: Backend API port (default `3000`)
- `CORS_ORIGIN`: Frontend origin (default `http://localhost:5173`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `REFRESH_TOKEN_PEPPER`

## Database Setup

- Run the SQL files in `database/schema/` in order:
  - `001_init_attendance.sql`
  - `002_refresh_tokens.sql`

## Run Backend (API)

From the repository root:

```bash
npm install
npm run dev
```

Health check:

- `GET http://localhost:3000/health`

## Run Frontend (Web)

From the `frontend/` folder:

```bash
npm install
npm run dev
```

Vite dev server default:

- `http://localhost:5173`

## Useful Scripts

Scripts are in `scripts/` and are intended for local development / seeding.

Examples:

- `scripts/seed-admin.js`
- `scripts/seed-academic-data.js`
- `scripts/migrate-refresh-tokens.js`

## Notes

- This repository intentionally does not commit `.env`.
- The root `.gitignore` is configured to ignore build artifacts and dependencies for both backend and frontend.
