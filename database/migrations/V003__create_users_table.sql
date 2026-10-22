CREATE TYPE user_type_enum AS ENUM (
    'MASTER',
    'MODERATOR'
);

CREATE TYPE user_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    enc_cpf_cnpj TEXT NOT NULL,
    email CITEXT NOT NULL,
    phone VARCHAR(16) NOT NULL,
    password_hash TEXT NOT NULL,
    type user_type_enum NOT NULL,
    status user_status_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_type_status_created_at ON users (type, status, created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_users_status_created_at ON users (status, created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_email_trgm ON users USING gin (email gin_trgm_ops);