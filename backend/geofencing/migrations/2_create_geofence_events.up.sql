CREATE TABLE geofence_events (
  id BIGSERIAL PRIMARY KEY,
  bus_id BIGINT NOT NULL,
  geofence_id BIGINT NOT NULL REFERENCES geofences(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('enter', 'exit')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_geofence_events_bus_id ON geofence_events(bus_id);
CREATE INDEX idx_geofence_events_geofence_id ON geofence_events(geofence_id);
CREATE INDEX idx_geofence_events_timestamp ON geofence_events(timestamp DESC);
