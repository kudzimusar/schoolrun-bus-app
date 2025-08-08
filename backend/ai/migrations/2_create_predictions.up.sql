CREATE TABLE predictions (
  id BIGSERIAL PRIMARY KEY,
  bus_id BIGINT NOT NULL,
  route_id BIGINT NOT NULL,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('eta', 'delay', 'traffic')),
  predicted_value DOUBLE PRECISION NOT NULL,
  confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  factors JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_predictions_bus_id ON predictions(bus_id);
CREATE INDEX idx_predictions_route_id ON predictions(route_id);
CREATE INDEX idx_predictions_type ON predictions(prediction_type);
CREATE INDEX idx_predictions_valid_until ON predictions(valid_until);
