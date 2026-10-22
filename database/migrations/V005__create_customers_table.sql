CREATE TABLE customers (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    enc_cpf_cnpj TEXT NULL,
    email CITEXT NULL,
    phone VARCHAR(16) NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_created_at_active ON customers (created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_name_active ON customers (name, id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_email_active ON customers (email, id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_name_trgm_active ON customers USING gin (name gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_email_trgm_active ON customers USING gin (email gin_trgm_ops) WHERE deleted_at IS NULL;