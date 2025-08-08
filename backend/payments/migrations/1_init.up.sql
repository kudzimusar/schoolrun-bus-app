-- payments/migrations/1_init.up.sql
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL,
  msisdn TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'ecocash',
  provider_ref TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  raw_request JSONB,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);