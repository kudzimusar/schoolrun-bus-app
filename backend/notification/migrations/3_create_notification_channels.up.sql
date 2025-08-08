-- notification/migrations/3_create_notification_channels.up.sql
CREATE TABLE notification_channels (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('fcm', 'sms', 'email')),
  identifier TEXT NOT NULL, -- fcm token, phone number, or email address
  platform TEXT,            -- web/ios/android for fcm
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (channel, identifier)
);

CREATE INDEX idx_notification_channels_user ON notification_channels(user_id);
CREATE INDEX idx_notification_channels_channel ON notification_channels(channel);