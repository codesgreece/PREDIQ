# PREDIQ — AI Sports Predictions

Premium platform for **manually researched, AI-assisted** sports predictions. Administrators select matches, research them, draft analyses, and explicitly publish. The public site shows only published predictions and transparent historical performance — never fixtures calendars, live scores, or auto-generated tips.

## Stack

- Next.js App Router (TypeScript, Tailwind CSS)
- PostgreSQL + Prisma ORM
- Database-backed sessions (HTTP-only cookies)
- Zod validation
- Vercel-compatible single Next.js app

## Quick start

### 1. Prerequisites

- Node.js 20+
- PostgreSQL 14+

### 2. Configure environment

```bash
cp .env.example .env
```

Set at least:

- `DATABASE_URL`
- `SESSION_SECRET` (≥ 32 chars)
- `CSRF_SECRET` (≥ 32 chars)
- `APP_URL`
- `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` (first admin)

### 3. Install, migrate, seed

```bash
npm install
npx prisma migrate dev
npm run db:seed
```

Or bootstrap only the admin user:

```bash
npm run bootstrap-admin
```

Public registration is disabled by design.

### 4. Run

```bash
npm run dev
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847).

- Public site: `/`
- Admin: `/admin` (after `/login`)

## Sports data provider

PREDIQ includes an adapter for **API-Football** (`api-sports.io`):

1. Obtain an API key and review commercial / logo licensing terms.
2. Set `API_FOOTBALL_KEY` (and optionally `API_FOOTBALL_BASE_URL`).
3. Run:

```bash
npm run sync:sports
```

Or trigger sync from **Admin → Data sources**.

Without credentials, the sync job fails with a clear configuration message. The local seed uses a `seed` provider for development fixtures only — it is **not** a licensed worldwide catalog.

Logo URLs from the provider should be served via the provider CDN (or your own authorized hosting). Do not scrape Google Images.

## AI research assistance

Optional. Set `AI_API_KEY` (+ `AI_API_BASE_URL`, `AI_MODEL`) for OpenAI-compatible draft assistance.

- AI never publishes predictions.
- Missing credentials produce an explicit non-inventive research scaffold.
- The app does not claim web browsing occurred unless a search integration actually runs (`searchRan`).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 3847 |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run test` | Vitest suite |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run db:seed` | Seed admin + demo catalog |
| `npm run bootstrap-admin` | Create/update first admin |
| `npm run sync:sports` | Sync competitions/teams via API-Football |

## Deployment (Vercel)

1. Provision managed PostgreSQL (Neon, Supabase Postgres, RDS, etc.).
2. Set all secrets from `.env.example` in the Vercel project.
3. Build command: `prisma migrate deploy && next build` (or use `npm run db:deploy` in a release step).
4. Do not store production data or uploads on the ephemeral serverless filesystem.

## Security notes

- Admin routes require server-side session checks (`requireAdmin`).
- CSRF tokens required for mutating auth/admin endpoints.
- Rate limiting on login.
- HTML analysis content is sanitized before render.
- Drafts and `/admin` are `noindex`.

## Methodology

- **Hit rate** = Won / (Won + Lost) × 100. Pending and void excluded.
- **ROI** only when every settled WON/LOST row has valid stake and odds.
- Settled results cannot be silently rewritten; status changes require notes.
