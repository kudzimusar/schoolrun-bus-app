CREATE TABLE route_analytics (
  id BIGSERIAL PRIMARY KEY,
  route_id BIGINT NOT NULL,
  date DATE NOT NULL,
  total_trips INTEGER NOT NULL DEFAULT 0,
  on_time_trips INTEGER NOT NULL DEFAULT 0,
  average_delay_minutes DOUBLE PRECISION DEFAULT 0,
  fuel_consumption DOUBLE PRECISION,
  distance_traveled DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_route_analytics_route_id ON route_analytics(route_id);
CREATE INDEX idx_route_analytics_date ON route_analytics(date DESC);
CREATE UNIQUE INDEX idx_route_analytics_route_date ON route_analytics(route_id, date);
