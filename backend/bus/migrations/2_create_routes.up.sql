CREATE TABLE routes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bus_id BIGINT REFERENCES buses(id) ON DELETE SET NULL,
  school_id BIGINT,
  route_type TEXT NOT NULL CHECK (route_type IN ('morning', 'afternoon')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_routes_bus_id ON routes(bus_id);
CREATE INDEX idx_routes_school_id ON routes(school_id);
CREATE INDEX idx_routes_type ON routes(route_type);
