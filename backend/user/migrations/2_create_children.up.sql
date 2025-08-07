CREATE TABLE children (
  id BIGSERIAL PRIMARY KEY,
  parent_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  school_id BIGINT,
  bus_id BIGINT,
  bus_stop_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_children_bus_id ON children(bus_id);
