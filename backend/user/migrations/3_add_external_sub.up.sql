-- Add external_sub mapping for JWT subjects
ALTER TABLE users ADD COLUMN IF NOT EXISTS external_sub TEXT UNIQUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_external_sub ON users(external_sub);