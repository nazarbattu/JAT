# JAT Frontend

React SPA for Job Application Tracker.

## Stack

- React 19 + TypeScript
- Vite 8
- TanStack Router & Query
- Tailwind CSS 4 + Base UI / shadcn-style components
- Zod + React Hook Form
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Typecheck + production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | ESLint |

## Environment

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API origin |

## Notes

- API client: `src/lib/api.ts`
- Feature modules under `src/features/`
- Pages under `src/pages/`
