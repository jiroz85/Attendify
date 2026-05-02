CREATE TABLE refresh_tokens (
  id BIGSERIAL PRIMARY KEY,

  user_id BIGINT NOT NULL,

  jti UUID NOT NULL,
  token_hash CHAR(64) NOT NULL,

  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_refresh_tokens_jti UNIQUE (jti),

  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- Indexes (PostgreSQL style)
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);