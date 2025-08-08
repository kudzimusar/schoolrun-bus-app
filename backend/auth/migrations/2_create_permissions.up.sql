CREATE TABLE role_permissions (
  id BIGSERIAL PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('parent', 'driver', 'admin', 'operator')),
  resource TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_role_permissions_unique ON role_permissions(role, resource, action);

-- Insert default permissions
INSERT INTO role_permissions (role, resource, action) VALUES
-- Parent permissions
('parent', 'children', 'read'),
('parent', 'bus_location', 'read'),
('parent', 'notifications', 'read'),
('parent', 'notifications', 'update'),
('parent', 'notification_preferences', 'read'),
('parent', 'notification_preferences', 'update'),

-- Driver permissions
('driver', 'bus_location', 'create'),
('driver', 'bus_location', 'update'),
('driver', 'route', 'read'),
('driver', 'student_manifest', 'read'),
('driver', 'incident', 'create'),
('driver', 'notifications', 'create'),

-- Admin permissions
('admin', 'buses', 'create'),
('admin', 'buses', 'read'),
('admin', 'buses', 'update'),
('admin', 'buses', 'delete'),
('admin', 'routes', 'create'),
('admin', 'routes', 'read'),
('admin', 'routes', 'update'),
('admin', 'routes', 'delete'),
('admin', 'users', 'create'),
('admin', 'users', 'read'),
('admin', 'users', 'update'),
('admin', 'geofences', 'create'),
('admin', 'geofences', 'read'),
('admin', 'geofences', 'update'),
('admin', 'geofences', 'delete'),
('admin', 'analytics', 'read'),

-- Operator permissions (all permissions)
('operator', 'buses', 'create'),
('operator', 'buses', 'read'),
('operator', 'buses', 'update'),
('operator', 'buses', 'delete'),
('operator', 'routes', 'create'),
('operator', 'routes', 'read'),
('operator', 'routes', 'update'),
('operator', 'routes', 'delete'),
('operator', 'users', 'create'),
('operator', 'users', 'read'),
('operator', 'users', 'update'),
('operator', 'users', 'delete'),
('operator', 'geofences', 'create'),
('operator', 'geofences', 'read'),
('operator', 'geofences', 'update'),
('operator', 'geofences', 'delete'),
('operator', 'analytics', 'read'),
('operator', 'system', 'read'),
('operator', 'system', 'update');
