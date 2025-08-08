CREATE TABLE performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('on_time_rate', 'fuel_efficiency', 'route_completion', 'incident_rate')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('bus', 'route', 'driver', 'system')),
  entity_id BIGINT,
  value DOUBLE PRECISION NOT NULL,
  unit TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_entity ON performance_metrics(entity_type, entity_id);
CREATE INDEX idx_performance_metrics_date ON performance_metrics(date DESC);
CREATE UNIQUE INDEX idx_performance_metrics_unique ON performance_metrics(metric_type, entity_type, entity_id, date);
