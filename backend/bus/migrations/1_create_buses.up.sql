CREATE TABLE buses (
  id BIGSERIAL PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  driver_id BIGINT,
  capacity INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_buses_number ON buses(number);
CREATE INDEX idx_buses_driver_id ON buses(driver_id);
CREATE INDEX idx_buses_status ON buses(status);
