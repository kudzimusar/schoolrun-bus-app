-- Add support for polygon-based geofences
ALTER TABLE geofences ADD COLUMN is_polygon BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE geofences ADD COLUMN polygon_coordinates JSONB; -- Array of [lat, lng] pairs

-- Add a comment to explain the structure
COMMENT ON COLUMN geofences.polygon_coordinates IS 'JSON array of coordinate pairs for polygon geofences, e.g., [[lat1, lng1], [lat2, lng2], ...]';
