# Job Application Tracker (JAT)

Personal app to track job applications by company, job, and conversation thread — including contacts, interactions, follow-ups, and remarks.

See [SCHEMA.md](./SCHEMA.md) for the data model.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript, TanStack Router/Query, Tailwind CSS 4 |
| Backend | Spring Boot 4, Java 21, JPA, PostgreSQL |
| Package manager (FE) | pnpm |

## Repo structure

```text
JAT/
├── frontend/     # Vite + React SPA
├── backend/      # Spring Boot API
└── SCHEMA.md     # Domain model
```

## Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io)
- JDK 21 and Maven (or use `backend/mvnw`)
- PostgreSQL with a database named `jat` (or override via env)

## Quick start

### 1. Database

Create a Postgres DB (defaults match `backend/.env.example`):

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jat
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

### 2. Backend

```bash
cd backend
cp .env.example .env
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd spring-boot:run`.

API: `http://localhost:8080`

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

App: `http://localhost:5173` (API base defaults to `http://localhost:8080`; override with `VITE_API_BASE_URL`).

## Docs

- Frontend: [frontend/README.md](./frontend/README.md)
- Backend: [backend/README.md](./backend/README.md)
- Schema: [SCHEMA.md](./SCHEMA.md)
