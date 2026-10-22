# Security

## Authentication

### Access token (JWT)

- Algorithm **HS256** (`jose`)
- Relevant claims: `sub` (user id), `iss` (`USER`), `access_level` (`MASTER` | `MODERATOR`), `iat`, `exp`
- Short TTL (~15 minutes)
- Sent as: `Authorization: Bearer <token>`

### Refresh token

- Random value (base64url); **only the HMAC-SHA256 hash** is stored
- Cookie `refresh_token`:
  - `HttpOnly`
  - `SameSite=Lax`
  - `Secure` in production
  - `Path=/api/v1/sessions`
- Rotated on every refresh: old session revoked, new one with `parent_id` and same `family_id`
- Reuse of a revoked/expired token: **entire family** is revoked + `403`

### Passwords

- Hashed with **Argon2** (`HashProvider`)
- Never returned in outputs (`passwordHash` excluded from mappers)

---

## Authorization (RBAC)

`JwtGuard(jwtService, subjectType, accessLevels?)`:

1. Requires `Bearer ` prefix
2. Validates signature, issuer, and expiry
3. If `accessLevels` is set, requires `claims.accessLevel` ∈ list

Examples:

- `/users/me`, `/customers`, `/products`: any authenticated user (`USER`)
- `POST /users`: `MASTER` only
- `/audit-logs`: `MASTER` or `MODERATOR`

`INACTIVE` users cannot log in successfully.

---

## Sensitive data

| Data | Handling |
|------|----------|
| CPF/CNPJ | AES-256-GCM; 32-byte key (`ENCRYPTION_KEY` base64) |
| Password | Argon2 |
| Refresh token | HMAC in the database |
| JWT secret | `JWT_SECRET_KEY` from env only |

Entity `toJSON()` masks sensitive fields (e.g. refresh hash, tax id) before audit persistence.

---

## HTTP protections

- **Helmet** — default security headers
- **CORS** — fixed origin (`WEB_URL`), credentials for cookies
- **Rate limit** — Redis; lower limits on login/refresh
- **Body limit** and **request timeout** in Fastify
- **Zod** validation at the edge (malformed input → 422)

---

## Auditing

Important mutations go through `AuditLogProvider.logTx` **inside** the same transaction as the operation:

- `action`: CREATE | UPDATE | DELETE | …
- `resource`: USER | SESSION | CUSTOMER | PRODUCT
- `before` / `after` (JSONB)
- IP, user-agent, optional metadata

Query access is limited to administrative roles.

---

## Secrets and environment

- `.env*` in `.gitignore` (except `.env.example`)
- `.dockerignore` keeps real env files out of the image
- Compose uses `${VAR:?required}` to fail fast on missing config
- Generate: `make generate-secret` or `openssl rand -base64 32`

---

## Production checklist

- [ ] Unique, strong secrets (not the ones from `.env.example`)
- [ ] `ENV=production` and `Secure` cookies
- [ ] `DATABASE_SSLMODE=require` when applicable
- [ ] Redis password if exposed
- [ ] HTTPS at the reverse proxy
- [ ] Migrations applied; app DB user with least privilege
