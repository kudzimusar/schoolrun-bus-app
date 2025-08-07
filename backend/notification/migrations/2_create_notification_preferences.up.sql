CREATE TABLE notification_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  bus_approaching BOOLEAN NOT NULL DEFAULT true,
  bus_arrived BOOLEAN NOT NULL DEFAULT true,
  bus_delayed BOOLEAN NOT NULL DEFAULT true,
  route_changed BOOLEAN NOT NULL DEFAULT true,
  emergency BOOLEAN NOT NULL DEFAULT true,
  approach_time_minutes INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
