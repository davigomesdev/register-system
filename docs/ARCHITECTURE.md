# Architecture

## Goal

Describe how **Register System** organizes code, responsibilities, and the path of an HTTP request down to the database — useful for code review in hiring processes and for onboarding.

---

## Architectural style

The project follows a **modular + layered** approach (close to Clean / Hexagonal architecture):

- The **domain** does not depend on Fastify, `pg`, or Redis.
- **Use cases** orchestrate rules and ports (repository interfaces).
- **Infrastructure** implements ports (PostgreSQL, JWT, encryption, cache).
- **Adapters** adapt HTTP (routes, controllers, guards, presenters).

This keeps framework or database changes localized and makes unit tests straightforward with mocks at the boundaries.

---

## Layers

```text
┌─────────────────────────────────────────────────────────┐
│  Adapters (HTTP)                                        │
│  Router → JwtGuard → Controller → Presenter / errors    │
└───────────────────────────┬─────────────────────────────┘
                            │ Validated DTO + Context
┌───────────────────────────▼─────────────────────────────┐
│  Application                                            │
│  UseCase.execute(ctx, input) → OutputMapper             │
│  Providers (Hash, AuditLog)                             │
└───────────────────────────┬─────────────────────────────┘
                            │ Entity / Repository port
┌───────────────────────────▼─────────────────────────────┐
│  Domain                                                 │
│  Entity, enums, SearchParams, domain errors             │
└───────────────────────────┬─────────────────────────────┘
                            │ Repository interface
┌───────────────────────────▼─────────────────────────────┐
│  Infrastructure                                         │
│  PersistenceRepository, Model (row → entity),           │
│  JwtService, EncryptionService, CacheService, Env       │
└─────────────────────────────────────────────────────────┘
```

### Adapters

| Piece | Responsibility |
|-------|----------------|
| `*-router.ts` | Registers routes, Zod schemas, auth hooks |
| `*-controller.ts` | Reads body/params/query, calls use case, sets HTTP status |
| `JwtGuard` | Validates Bearer JWT and access level |
| `ErrorFilter` | Maps domain / Zod errors → error JSON |
| `Presenter` | Envelope `{ data }` and `{ data, meta }` |
| `ContextFactory` | `actorId`, IP, user-agent from the request |

### Application

- **DTOs**: Zod schemas (`createXSchema`, params, search).
- **Use cases**: one class per operation (`CreateUserUsecase`, …).
- **Outputs**: response types + `*OutputMapper.toOutput(entity)`.
- **AuditLogProvider**: writes logs inside the transaction.

### Domain

- `Entity<T>` with Snowflake IDs.
- Module entities (`UserEntity`, `SessionEntity`, …) with business methods (`softDelete`, `revoke`, `isActive`).
- `*Repository` interfaces and `*SearchParams` / `*SearchResult` classes.
- Errors: `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, etc.

### Infrastructure

- `PersistenceService`: `pg` pool + transactional `begin(fn)`.
- `*PersistenceRepository`: parameterized SQL; `*Model.toEntity(row)`.
- `JwtService` (jose), `EncryptionService` (AES-GCM), `HashProvider` (Argon2 + HMAC), `CacheService` (ioredis).

---

## Authenticated request flow

Example: `PUT /api/v1/customers/:id`

1. Fastify applies Zod schema (params + body) → **422** if invalid.
2. `JwtGuard` validates `Authorization: Bearer …` and sets `req.claims`.
3. Controller builds `Context` and calls `UpdateCustomerUsecase`.
4. Use case: `repository.get(id)` → `entity.update(props)` → `persistence.begin`:
   - `updateTx`
   - `auditLogProvider.logTx` (before/after)
5. `CustomerOutputMapper.toOutput` → `Presenter.wrapper` → **200**.

Business mutations and audit share the **same transaction**: both commit or neither does.

---

## Business modules

| Module | Route prefix | Notes |
|--------|--------------|-------|
| `session` | `/api/v1/sessions` | Public login; `/me` authenticated |
| `user` | `/api/v1/users` | `/me` and admin; create is `MASTER` only |
| `customer` | `/api/v1/customers` | Soft delete |
| `product` | `/api/v1/products` | Soft delete + Decimal |
| `audit-log` | `/api/v1/audit-logs` | Read-only; MASTER/MODERATOR |

Each module is self-contained under `src/modules/<name>/`, reducing coupling between contexts.

---

## Authentication & session (architectural view)

```text
Login
  → verify password (Argon2)
  → create SessionEntity (refresh hash, family_id = id)
  → JWT access (sub = userId, access_level = type)
  → HttpOnly refresh_token cookie

Refresh
  → read cookie → hash → load session
  → if inactive: revoke family (reuse detection) → 403
  → else: revoke current session, create child (parent_id), new JWT + cookie

Logout / revoke
  → set revoked_at; revoke-all clears the cookie
```

The access token is **stateless** (JWT); the refresh token is **stateful** (`sessions` table), which enables real revocation.

---

## Cross-cutting concerns

- **Logging**: Pino on Fastify; context via `Context.log`.
- **Rate limit**: `@fastify/rate-limit` with Redis; tighter limits on login/refresh.
- **CORS**: origin = `WEB_URL`, credentials enabled (cookie).
- **Helmet**: standard security headers.
- **Multipart**: prepared for uploads (size limits).

---

## Testability

| Level | Strategy |
|-------|----------|
| Unit | Mock repository/provider; test use case, entity, DTO, model |
| E2E | `buildTestApp(deps)` + `app.inject()`; no Postgres |
| Integration | Real repositories + pool; skip if `DATABASE_*` is missing |

Central helper: `test/helpers/build-test-app.ts`.

---

## Deployment

- **Dockerfile** multi-stage: deps → build → Alpine runner, non-root.
- **Compose** separates Postgres, Redis, migrate, seed, and API.
- Secrets only via env; the image never contains a real `.env`.

---

## Diagram

Editable file: [diagrams/architecture.drawio](diagrams/architecture.drawio).
