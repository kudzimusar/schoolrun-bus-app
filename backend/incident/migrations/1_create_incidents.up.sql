CREATE TABLE incidents (
  id BIGSERIAL PRIMARY KEY,
  bus_id BIGINT NOT NULL,
  driver_id BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('delay', 'breakdown', 'accident', 'emergency', 'route_deviation', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_incidents_bus_id ON incidents(bus_id);
CREATE INDEX idx_incidents_driver_id ON incidents(driver_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_reported_at ON incidents(reported_at DESC);
