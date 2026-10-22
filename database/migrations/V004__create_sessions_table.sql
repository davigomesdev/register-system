CREATE TABLE sessions (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    family_id BIGINT NOT NULL,
    parent_id BIGINT NULL,
    refresh_token_hash TEXT NOT NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    device_info TEXT NULL,
    last_used_at TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uq_sessions_refresh_token_hash UNIQUE (refresh_token_hash),

    CONSTRAINT chk_sessions_last_used_after_created CHECK (last_used_at >= created_at),
    CONSTRAINT chk_sessions_expires_after_created CHECK (expires_at > created_at),
    CONSTRAINT chk_sessions_updated_after_created CHECK (updated_at >= created_at),
    CONSTRAINT chk_sessions_revoked_after_created CHECK (revoked_at IS NULL OR revoked_at >= created_at),

    CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_sessions_parent_id FOREIGN KEY (parent_id) REFERENCES sessions(id)
);

CREATE UNIQUE INDEX uq_sessions_parent_id ON sessions (parent_id) WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_user_id_id ON sessions (user_id, id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id_created_at ON sessions (user_id, created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id_last_used_at ON sessions (user_id, last_used_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_sessions_family_id ON sessions (family_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id_active ON sessions (user_id, expires_at) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_family_id_active ON sessions (family_id) WHERE revoked_at IS NULL;