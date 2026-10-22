# Database

PostgreSQL **17**, versioned migrations (`database/migrations/V00x__*.sql`), seeds under `database/seeds/`.

---

## Extensions

| Extension | Purpose |
|-----------|---------|
| `citext` | Case-insensitive email (`users.email`, `customers.email`) |
| `pg_trgm` | GIN indexes for `ILIKE '%term%'` |

---

## Enums

| Type | Values |
|------|--------|
| `actor_type_enum` | `USER`, `SYSTEM` |
| `user_type_enum` | `MASTER`, `MODERATOR` |
| `user_status_enum` | `ACTIVE`, `INACTIVE` |
| `product_gender_enum` | `MALE`, `FEMALE`, `UNDEFINED` |

Audit actions/resources are `VARCHAR` in the database, aligned with domain enums (`CREATE`, `UPDATE`, `DELETE`, … / `USER`, `SESSION`, `CUSTOMER`, `PRODUCT`).

---

## Tables

### users

| Column | Type | Notes |
|--------|------|--------|
| id | BIGINT PK | Snowflake |
| name | VARCHAR(255) | |
| enc_cpf_cnpj | TEXT | AES-GCM (not plaintext) |
| email | CITEXT | UNIQUE |
| phone | VARCHAR(16) | |
| password_hash | TEXT | Argon2 |
| type | user_type_enum | |
| status | user_status_enum | |
| created_at / updated_at | TIMESTAMPTZ | |

Typical queries: by `id`, by `email`, search with ILIKE + type/status filters + ORDER BY name|email|created_at.

### sessions

| Column | Type | Notes |
|--------|------|--------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users | |
| family_id | BIGINT | Refresh chain |
| parent_id | BIGINT FK → sessions | NULL at root; partial UNIQUE |
| refresh_token_hash | TEXT | UNIQUE (HMAC) |
| ip_address | INET | |
| user_agent / device_info | TEXT | |
| last_used_at / expires_at | TIMESTAMPTZ | |
| revoked_at | TIMESTAMPTZ NULL | Active if NULL and not expired |
| created_at / updated_at | TIMESTAMPTZ | |

Checks enforce temporal consistency (expires > created, etc.).

### customers

Soft delete via `deleted_at`. Optional encrypted tax id (`enc_cpf_cnpj`). Optional `CITEXT` email.

Listings always use `deleted_at IS NULL`.

### products

| Column | Notes |
|--------|--------|
| sku | VARCHAR(60), searchable |
| cost_price | DECIMAL(15,4), CHECK >= 0 |
| gender | product_gender_enum |
| deleted_at | soft delete |

### audit_logs

| Column | Notes |
|--------|--------|
| actor_id / resource_id | BIGINT nullable |
| actor_type | USER or SYSTEM (CHECK: SYSTEM or actor_id NOT NULL) |
| action / resource | VARCHAR |
| before / after / metadata | JSONB |
| ip_address | INET |
| created_at | TIMESTAMPTZ |

Append-mostly; no business update/delete.

---

## Relationships

```text
users 1 ──< sessions (user_id)
sessions 1 ──< sessions (parent_id)     # refresh rotation
users 1 ──< audit_logs (actor_id)       # logical; optional join
```

Customers and products have **no** FK to users; traceability lives in the audit log (`actor_id` + `resource_id`).

---

## Performance indexes (V007)

Aligned with `*PersistenceRepository` queries:

- **users**: `(type, status, created_at)`, GIN trgm on name/email
- **sessions**: `(user_id, id)`, per-user sort keys, partials `WHERE revoked_at IS NULL`
- **customers / products**: partials `WHERE deleted_at IS NULL` + trgm + gender/sku
- **audit_logs**: `(created_at)`, `(actor_id, created_at)`, `(resource_id, created_at)`, `(resource, action, created_at)`

Already present in the base schema: PKs, `uq_users_email`, `uq_sessions_refresh_token_hash`, `uq_sessions_parent_id`.

---

## Soft delete

Customers and products are **not** physically removed by API delete operations. Repositories filter `deleted_at IS NULL` on get/search/update.

---

## IDs

Generated in the application with **Snowflake** (epoch configured for 2026-01-01), stored as `BIGINT`. Exposed as **strings** in JSON to avoid precision loss in JavaScript.

---

## ER diagram

Editable file: [diagrams/database.drawio](diagrams/database.drawio).
