# Register System

TypeScript **REST API** for managing users, sessions, customers, and products — with session-based authentication (JWT + refresh token), role-based access control (RBAC), and full audit logging.

Built to showcase solid backend engineering practices: layered architecture, isolated domain, security-first design, automated tests, and Docker-based deployment.

---

## Table of contents

- [Overview](#overview)
- [Stack](#stack)
- [Architecture](#architecture)
- [Modules & features](#modules--features)
- [Security](#security)
- [Database](#database)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts & Makefile](#scripts--makefile)
- [Testing](#testing)
- [HTTP API](#http-api)
- [Further documentation](#further-documentation)
- [Project structure](#project-structure)
- [Design decisions](#design-decisions)
- [License](#license)

---

## Overview

**Register System** exposes a versioned API under `/api/v1` with these main flows:

| Area | Responsibility |
|------|----------------|
| **Session** | Login, token refresh, list/revoke the current user's sessions |
| **User** | Admin CRUD, profile (`/me`), password change, status |
| **Customer** | Customer registry with soft delete |
| **Product** | Product registry (SKU, price, gender) with soft delete |
| **Audit log** | Query create/update/delete events |

Success responses use a consistent envelope:

```json
{ "data": { ... } }
```

Paginated lists:

```json
{
  "data": [ ... ],
  "meta": {
    "currentPage": 1,
    "perPage": 15,
    "lastPage": 3,
    "total": 42
  }
}
```

Errors:

```json
{
  "error": {
    "code": 401,
    "type": "UNAUTHORIZED",
    "messages": ["unauthorized"]
  }
}
```

---

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 22+, TypeScript (ESM, `NodeNext`) |
| HTTP | Fastify 5 + Zod (`fastify-type-provider-zod`) |
| Auth | JWT (jose) + refresh token in HttpOnly cookie |
| Passwords / tokens | Argon2 + HMAC-SHA256 |
| Sensitive data | AES-256-GCM (tax IDs) |
| Database | PostgreSQL 17 |
| Cache / rate limit | Redis 7 |
| IDs | Snowflake (`@sapphire/snowflake`) |
| Package manager | pnpm |
| Containers | Multi-stage Docker + Compose |
| Tests | Node.js Test Runner (`node:test`) |

---

## Architecture

Modular **Clean / Hexagonal-inspired** layout:

```
HTTP (Router → Controller → Presenter)
        ↓
   Application (Use cases + DTOs + Outputs)
        ↓
   Domain (Entities + Repository interfaces)
        ↓
   Infrastructure (PostgreSQL, Redis, JWT, Encryption)
```

Each feature module under `src/modules/<context>/` contains:

- **adapters** — Fastify routes and controllers
- **application** — use cases, Zod DTOs, output mappers
- **domain** — entities and repository contracts
- **infra** — PostgreSQL implementation (`*-persistence-repository`, models)

Shared layers:

- `src/adapters` — context, JWT guard, error filter, presenters
- `src/domain` — typed errors, enums, base entity, searchable repository
- `src/infra` — env, connection pool, cache, JWT, encryption
- `src/application/providers` — password/token hashing

Diagrams in [docs/diagrams/](docs/diagrams/) (Draw.io):

- `architecture.drawio` — component view and request flow
- `database.drawio` — entity-relationship model

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Modules & features

### Session
- Email/password login → access token (JWT) + refresh token (cookie)
- Refresh-token rotation (family id) and reuse detection
- List / get / revoke current session or all sessions for the actor

### User
- Roles: `MASTER` and `MODERATOR`
- Status: `ACTIVE` / `INACTIVE`
- `MASTER` creates users; other operations follow JWT guards
- `/users/me` endpoints for the authenticated actor

### Customer & Product
- CRUD with **soft delete** (`deleted_at`)
- Text search (ILIKE) and configurable sorting
- Product: SKU, decimal cost, gender (`MALE` | `FEMALE` | `UNDEFINED`)

### Audit log
- Written in the **same DB transaction** as business mutations
- Filter by actor, resource id, action, resource type
- Optional actor expansion (join on `users`)

---

## Security

| Concern | Implementation |
|---------|----------------|
| Passwords | Argon2 |
| Access token | JWT HS256, short-lived (~15 min) |
| Refresh token | Opaque value; HMAC hash in DB; HttpOnly / SameSite cookie |
| Tax IDs (CPF/CNPJ) | AES-256-GCM at rest |
| Authorization | `JwtGuard` by subject + access-level list |
| Transport | Helmet, CORS locked to `WEB_URL`, Redis rate limit |
| Audit | before/after JSONB on relevant mutations |
| Secrets | Environment only; never committed |

More: [docs/SECURITY.md](docs/SECURITY.md).

---

## Database

- Versioned migrations in `database/migrations/` (Flyway-style `V00x__*.sql`)
- Seeds in `database/seeds/`
- Extensions: `citext`, `pg_trgm` (search)
- Performance indexes aligned with repository SQL (`V007`)

Schema and indexes: [docs/DATABASE.md](docs/DATABASE.md) and [docs/diagrams/database.drawio](docs/diagrams/database.drawio).

Core tables: `users`, `sessions`, `customers`, `products`, `audit_logs`.

---

## Prerequisites

- Node.js **22+**
- pnpm **12+** (via Corepack)
- Docker and Docker Compose (recommended)
- OpenSSL (secret generation)

```bash
corepack enable
corepack prepare pnpm@12.14.0 --activate
```

---

## Quick start

### With Docker (recommended)

```bash
cp .env.example .env.development   # adjust secrets if needed
make generate-secret               # optional: new secrets

make up-dev                        # Postgres, Redis, etc.
make migrate-dev
make seed-dev

pnpm install
pnpm dev
```

Full stack (API inside a container):

```bash
make up          # docker compose up -d --build
make logs
```

Healthcheck: `GET http://127.0.0.1:5000/health` → `{ "status": "ok" }`.

### API only (local)

1. Run PostgreSQL and Redis
2. Copy `.env.example` → `.env.development` and point hosts/ports
3. Apply migrations/seeds
4. `pnpm install && pnpm dev`

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `ENV` | Environment name (`development`, `production`, …) |
| `LOG_LEVEL` | Pino log level |
| `HOST` / `PORT` | API bind address |
| `WEB_URL` | Allowed CORS origin |
| `DATABASE_*` | PostgreSQL connection |
| `REDIS_*` | Redis (rate limiting) |
| `JWT_SECRET_KEY` | JWT signing key (32+ bytes, base64) |
| `ENCRYPTION_KEY` | AES-256 key (exactly 32 bytes, base64) |
| `REFRESH_TOKEN_SECRET_KEY` | HMAC key for refresh tokens |

Generate secrets:

```bash
make generate-secret
# or: openssl rand -base64 32
```

Never commit `.env.development` / `.env.production` — only `.env.example`.

---

## Scripts & Makefile

### pnpm

```bash
pnpm dev                 # API with tsx + .env.development
pnpm build               # tsc -p tsconfig.build.json
pnpm start               # dist/ with .env.production
pnpm test                # unit (src) + e2e
pnpm test:unit
pnpm test:e2e
pnpm test:integration    # needs DATABASE_* (Postgres)
pnpm lint
```

### Makefile (Docker)

```bash
make up / down / logs / clean
make up-dev / migrate-dev / seed-dev
make up-prod / migrate-prod / seed-prod
make generate-secret
```

---

## Testing

| Kind | Location | Dependencies |
|------|----------|--------------|
| Unit | `src/**/tests` | None (mocks) |
| E2E HTTP | `test/e2e` | Fastify `inject` + mocked repositories |
| Integration | `test/integration` | Real PostgreSQL (`DATABASE_*`); auto-skip if missing |

Stack: **Node Test Runner** + `node:assert/strict` (no Jest/Vitest).

```bash
pnpm test:e2e
pnpm test:integration   # with stack + --env-file
```

---

## HTTP API

Base path: `/api/v1`

| Resource | Prefix | Auth |
|----------|--------|------|
| Sessions | `/sessions` | Login public; `/me` authenticated |
| Users | `/users` | JWT; create restricted to `MASTER` |
| Customers | `/customers` | JWT |
| Products | `/products` | JWT |
| Audit logs | `/audit-logs` | JWT (`MASTER` \| `MODERATOR`) |

Ready-made REST Client / IntelliJ HTTP files: [`docs/http/`](docs/http/).

Full reference: [docs/API.md](docs/API.md).

---

## Further documentation

| Document | Content |
|----------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layers, request flow, modules |
| [docs/DATABASE.md](docs/DATABASE.md) | Tables, enums, indexes, soft delete |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, crypto, cookies, rate limit |
| [docs/API.md](docs/API.md) | Endpoints, status codes, examples |
| [docs/diagrams/architecture.drawio](docs/diagrams/architecture.drawio) | Architecture diagram |
| [docs/diagrams/database.drawio](docs/diagrams/database.drawio) | Database ER diagram |
| [docs/http/*.http](docs/http/) | Manual HTTP requests |

Open `.drawio` files in [diagrams.net](https://app.diagrams.net/) or the Draw.io IDE extension.

---

## Project structure

```text
.
├── database/
│   ├── migrations/          # V001…V007 (schema + indexes)
│   └── seeds/
├── docs/
│   ├── diagrams/            # architecture.drawio, database.drawio
│   ├── http/                # .http collections
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   └── SECURITY.md
├── src/
│   ├── adapters/            # cross-cutting HTTP
│   ├── application/         # shared DTOs & providers
│   ├── domain/              # errors, enums, base entity
│   ├── infra/               # env, pg, redis, jwt, encryption
│   ├── modules/             # audit-log, customer, product, session, user
│   └── main.ts
├── test/
│   ├── e2e/
│   ├── helpers/
│   └── integration/
├── docker-compose*.yml
├── Dockerfile
├── Makefile
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## Design decisions

1. **ESM + `#src/*`** — stable imports across dev (`src`) and prod (`dist`) via `package.json#imports` and `customConditions: ["development"]`.
2. **Zod at the HTTP boundary** — validation and coercion (`bigint`, decimal) before use cases.
3. **One use case per operation** — easy to test and to audit.
4. **Shared transaction for data + audit** — consistency between business row and log.
5. **Soft delete** on customers/products — history retained.
6. **Refresh rotation** — mitigates token theft via family invalidation.
7. **Native Node tests** — no test-framework lock-in.
8. **Multi-stage Docker** — small final image, non-root user.

---

## Author

**Davi Gomes** — [davigomescarmo9@gmail.com](mailto:davigomescarmo9@gmail.com)

---

## License

MIT — see [LICENSE](LICENSE).
