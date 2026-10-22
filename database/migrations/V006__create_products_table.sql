CREATE TYPE product_gender_enum AS ENUM (
    'MALE',
    'FEMALE',
    'UNDEFINED'
);

CREATE TABLE products  (
    id BIGINT PRIMARY KEY,
    sku  VARCHAR(60) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NULL,
    description TEXT NULL,
    cost_price DECIMAL(15, 4) NOT NULL,
    gender product_gender_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ NULL,

    CONSTRAINT chk_products_cost_price CHECK (cost_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_products_sku_active ON products (sku) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_gender_created_at_active ON products (gender, created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_created_at_active ON products (created_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_name_active ON products (name, id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_cost_price_active ON products (cost_price, id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm_active ON products USING gin (name gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_sku_trgm_active ON products USING gin (sku gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_slug_trgm_active ON products USING gin (slug gin_trgm_ops) WHERE deleted_at IS NULL;