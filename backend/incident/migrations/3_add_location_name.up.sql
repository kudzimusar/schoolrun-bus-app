ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_name TEXT;
CREATE INDEX IF NOT EXISTS idx_incidents_location_name ON incidents(location_name);