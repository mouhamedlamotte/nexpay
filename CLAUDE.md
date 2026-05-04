# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NexPay is a self-hosted open-source mobile payment aggregator for West Africa, supporting Wave and Orange Money. It exposes a REST API for merchants to initiate payments and receive webhooks, with a management dashboard for configuration.

## Development Setup

The full stack runs via Docker Compose. Copy `.env.example` to `.env` first, then:

```bash
# Start all services (Traefik + PostgreSQL + Redis + API + Web)
docker compose -f docker-compose-dev.yml up -d

# Dashboard: http://localhost:9090  (default: admin@admin.com / password)
# API docs: http://localhost:9090/api/v1/docs (dev only)
```

Ports: Traefik on `9090`, PostgreSQL on `54321`, Redis on `63791`.

### API (NestJS)

```bash
cd api
pnpm install
pnpm dev                    # watch mode on port 9000
pnpm test                   # unit tests (Jest, *.spec.ts in src/)
pnpm test:watch             # watch mode
pnpm test:e2e               # end-to-end tests
pnpm test:cov               # coverage
pnpm lint                   # ESLint + Prettier fix
pnpm build                  # compile to dist/
npx prisma migrate dev      # run migrations (requires DATABASE_URL)
npx prisma studio           # DB browser UI
```

### Web (Next.js)

```bash
cd web
pnpm install
pnpm dev     # dev server on port 9001
pnpm build   # production build
pnpm lint    # Next.js lint
```

## Docker Compose Files

There are three compose files with different purposes:

| File | Use case | Image source |
|---|---|---|
| `docker-compose.yml` | Standalone production (quick deploy) | `ghcr.io/mouhamedlamotte/nexpay:latest` — single unified image (API + Web) |
| `docker-compose-prod.yml` | Production with Traefik (SSL) | Built from source (`api/Dockerfile`, `web/Dockerfile`) |
| `docker-compose-dev.yml` | Local development (hot-reload) | Built from source, Traefik on port 9090 |

The standalone image (`docker-compose.yml`) runs API on port 9000 and web on port 9001 in a single container. `REDIS_URL` in that compose is constructed from `REDIS_PASSWORD` (not a standalone env var). `CORS_ORIGIN` is hardcoded to `http://localhost:9001` — override it when deploying behind a gateway.

## Architecture

### Monorepo Structure

```
api/   — NestJS backend
web/   — Next.js frontend
```

In dev, Traefik proxies `localhost:9090` → web (`:9001`) and `localhost:9090/api` → API (`:9000`).

### API Architecture (`api/src/`)

**Module layout:**
- `src/modules/app.module.ts` — root module wiring
- `src/lib/` — global shared code (exported as `CommonModule`): PrismaService, HashService, PaginationService, FilterService, TokensService, LoggerService, plus guards, filters, interceptors, DTOs, validators
- `src/modules/users/` — user management + JWT/local auth
- `src/modules/projects/` — multi-project management, per-project transactions, dashboard stats, webhooks config, redirect URLs
- `src/modules/providers/` — payment provider registry, per-provider secret/webhook config (Wave, OM), provider seeder
- `src/modules/payments/` — direct payment initiation (`PaymentsModule`), payment sessions (`SessionPaymentModule`), inbound webhooks from providers (`webhook/`)

**Payment flow:**
1. Merchant calls `POST /api/v1/payment/initiate` (write key) → `PaymentsService` resolves provider → calls `PaymentAdapter` (wave or om) → creates `Transaction` with PENDING status → returns QR/checkout URLs.
2. Provider posts webhook to `POST /api/v1/webhook/{provider}` → `ProvidersWebhookGuard` validates signature (HMAC or shared-secret via `WebhookValidatorFactory`) → `WebhookService.handleWebhookUpdate()` updates transaction status → fans out to merchant webhooks.
3. For sessions: `POST /api/v1/payment/session/initiate` creates a `Session` record (status=`opened`) → redirect user to checkout URL → user picks provider → checkout page calls `POST /session/{id}/checkout` (status→`pending`, `paymentData` populated) → checkout page polls `POST /session/{id}/status` (long-polls 30s, checks every 2s) → provider webhook arrives → status→`completed`/`failed`.

**Session statuses:** `opened` → `pending` → `completed` | `failed` | `expired` (1 hour timeout) | `closed`

**`paymentData` field on Session:** JSON string, null until `POST /checkout` is called. Contains the full provider response (checkout_urls, qr_code, expiration, reference). Reused across multiple checkout calls for the same provider if not expired.

**Authentication:**
- Dashboard login: JWT (`Authorization: Bearer <token>`) via local strategy.
- API calls: `x-api-key` header — `ApiKeyGuard` checks against `X_WRITE_KEY` (write ops) or `X_READ_KEY` (read ops).

**Sensitive data:** Provider API secrets and webhook secrets are AES-256-GCM encrypted at rest via `HashService.encryptSensitiveData()`. `ENCRYPTION_KEY` env var must be a 64-char hex string (32 bytes).

**Prisma schema** is split across `api/prisma/schema/`: `schema.prisma` (generator/datasource), `projets.prisma` (Project, Webhook, Callback), `providers.prisma` (PaymentProvider, ProviderWebhook), `sessions.prisma` (Session), `items.prisma` (SessionItem).

### Frontend Architecture (`web/`)

**Routing (Next.js App Router):**
- `/auth/login` — login page
- `/admin/projects` — project selection (no auth layout)
- `/admin/(dashboard)/*` — authenticated dashboard (sidebar layout): home stats, transactions, providers config, settings (webhooks/redirects), users
- `/checkout/[id]` — public checkout page for payment sessions

**State management (Zustand):**
- `stores/app.store.ts` — global loading phases, theme, sidebar state (persisted)
- `stores/project.store.ts` — current project selection (persisted); fetches default project from API on init
- `web/app/admin/(dashboard)/stores/auth/` — auth state and login logic

**API layer:**
- `lib/api-client.ts` — axios instance with `NEXT_PUBLIC_API_URL` base URL, `NEXT_PUBLIC_READ_API_KEY` header, and JWT Bearer token injected from `access_token` cookie
- `lib/api/*.ts` — typed API functions per domain (auth, dashboard, projects, providers, transactions, project-settings, users)
- `providers/query-provider.tsx` + `lib/query-client.ts` — TanStack Query setup

**Runtime config:** In production, `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_READ_API_KEY` are injected at container startup into `public/config.js` as `window.__RUNTIME_CONFIG__`, read by `lib/config.ts`. In dev, standard `NEXT_PUBLIC_*` env vars are used.

**UI library:** shadcn/ui components in `components/ui/` (Radix UI primitives + Tailwind CSS v4). Feature-specific components live in `components/<domain>/` and `features/<domain>/`.

### Key Environment Variables

| Variable | Description |
|---|---|
| `JWT_SECRET` | JWT signing secret |
| `ENCRYPTION_KEY` | 64-char hex for AES-256-GCM encryption of provider secrets |
| `X_WRITE_KEY` | API key for payment initiation (server-side only) |
| `X_READ_KEY` | API key for read operations (safe for client-side) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin credentials |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string (used in prod builds; `docker-compose.yml` constructs it from `REDIS_PASSWORD`) |
| `APP_DOMAIN` | Public domain, used to construct provider logo/media URLs and CORS |
| `CORS_ORIGIN` | Allowed origin in production (must match the web dashboard URL) |

**Seeded providers at startup:** `wave` (requires `api_key`) and `om` (requires `client_id`, `client_secret`, `name`, `code`). Both are inactive until configured.

### Adding a New Payment Provider

1. Create adapter in `api/src/modules/payments/adapters/` implementing `PaymentAdapter` interface (`initiate()` method).
2. Add provider-specific webhook config controller/service under `api/src/modules/providers/settings/webhook/`.
3. Seed the provider in `api/src/lib/modules/seeders/services/providers.seeder.service.ts` with `secretsFields`.
4. Register webhook validation logic in `WebhookValidatorFactory`.
