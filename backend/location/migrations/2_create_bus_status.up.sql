CREATE TABLE bus_status (
  id BIGSERIAL PRIMARY KEY,
  bus_id BIGINT NOT NULL UNIQUE,
  current_latitude DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'stopped' CHECK (status IN ('moving', 'stopped', 'delayed', 'off_route')),
  eta_minutes INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bus_status_bus_id ON bus_status(bus_id);
CREATE INDEX idx_bus_status_last_updated ON bus_status(last_updated DESC);
