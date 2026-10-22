# API Reference

Base URL: `http://<host>:<port>/api/v1`  
Content-Type: `application/json`  
Auth: `Authorization: Bearer <accessToken>` when required.

Collections: [http/](http/).

---

## Conventions

| Situation | Status |
|-----------|--------|
| Successful read | 200 |
| Created | 201 |
| Delete / revoke with no body | 204 |
| Zod validation failure | 422 |
| Unauthenticated | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Conflict (e.g. email) | 409 |
| Internal error | 500 |

Pagination (query): `page`, `perPage` (max 50), `sort`, `sortDir` (`asc` \| `desc`), plus resource-specific filters.

---

## Health

```http
GET /health
```

Outside `/api/v1`. Response: `{ "status": "ok" }`.

---

## Sessions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/sessions` | No | Login |
| POST | `/sessions/refresh` | Refresh cookie | New access + rotation |
| GET | `/sessions/me` | Yes | List actor sessions |
| GET | `/sessions/me/:id` | Yes | Detail |
| DELETE | `/sessions/me/:id` | Yes | Revoke one |
| DELETE | `/sessions/me` | Yes | Revoke all + clear cookie |

**Login body**

```json
{ "email": "user@email.local", "password": "123456" }
```

**201** — `{ "data": { "accessToken": "..." } }` + `Set-Cookie: refresh_token=...`

Useful list query params: `activeOnly=true`, `familyId`, pagination, sort (`createdAt`, `lastUsedAt`, `expiresAt`).

---

## Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | Yes | Actor profile |
| PUT | `/users/me` | Yes | Update profile |
| PUT | `/users/me/password` | Yes | Change password |
| GET | `/users` | Yes | Search |
| GET | `/users/:id` | Yes | By id |
| PUT | `/users/:id` | Yes | Admin update |
| PATCH | `/users/:id/status` | Yes | ACTIVE / INACTIVE |
| POST | `/users` | MASTER | Create user |

Search filters: `search`, `type`, `status`. Sort: `name`, `email`, `createdAt`.

**Create body (example)**

```json
{
  "name": "User example",
  "cpfCnpj": "52998224725",
  "email": "user@example.com",
  "phone": "+5585999999999",
  "password": "password1",
  "type": "MODERATOR"
}
```

---

## Customers

| Method | Path | Auth |
|--------|------|------|
| GET | `/customers` | Yes |
| GET | `/customers/:id` | Yes |
| POST | `/customers` | Yes |
| PUT | `/customers/:id` | Yes |
| DELETE | `/customers/:id` | Yes (soft) |

Filter: `search` (name/email). Sort: `name`, `email`, `createdAt`.

---

## Products

| Method | Path | Auth |
|--------|------|------|
| GET | `/products` | Yes |
| GET | `/products/:id` | Yes |
| POST | `/products` | Yes |
| PUT | `/products/:id` | Yes |
| DELETE | `/products/:id` | Yes (soft) |

Filters: `search` (name/sku/slug), `gender`. Sort: `name`, `sku`, `costPrice`, `createdAt`.

**Create body (example)**

```json
{
  "sku": "SKU-001",
  "name": "T-Shirt",
  "slug": "t-shirt",
  "description": "Cotton",
  "costPrice": "29.9000",
  "gender": "MALE"
}
```

---

## Audit logs

| Method | Path | Auth |
|--------|------|------|
| GET | `/audit-logs` | MASTER \| MODERATOR |
| GET | `/audit-logs/:id` | MASTER \| MODERATOR |

Filters: `actorId`, `resourceId`, `action`, `resource`.  
Query `actor=true` on get expands the actor user.  
Sort: `action`, `resource`, `createdAt`.

---

## Suggested manual test flow

1. `POST /sessions` with the seeded user → keep `accessToken` and cookie.
2. `GET /users/me` with Bearer.
3. Create customer/product; list; update; delete.
4. `GET /audit-logs` and inspect events.
5. `POST /sessions/refresh` (with cookie) and `DELETE /sessions/me`.
