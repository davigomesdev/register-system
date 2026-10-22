CREATE TYPE actor_type_enum AS ENUM (
    'USER',
    'SYSTEM'
);

CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY,
    actor_id BIGINT NULL,
    resource_id BIGINT NULL,
    actor_type actor_type_enum NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    before JSONB NULL,
    after JSONB NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    metadata JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT chk_audit_logs_actor_type CHECK (actor_type = 'SYSTEM' OR actor_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id_created_at ON audit_logs (actor_id, created_at DESC, id) WHERE actor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id_created_at ON audit_logs (resource_id, created_at DESC, id) WHERE resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_action_created_at ON audit_logs (resource, action, created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created_at ON audit_logs (action, created_at DESC, id);
