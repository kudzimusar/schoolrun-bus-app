import { api } from "encore.dev/api";
import { userDB } from "../user/db";
import { busDB } from "../bus/db";
import { locationDB } from "../location/db";
import { notificationDB } from "../notification/db";
import { geofencingDB } from "../geofencing/db";
import { analyticsDB } from "../analytics/db";

// Seeds the database with sample data for testing.
export const seedData = api<void, { message: string }>(
  { expose: true, method: "POST", path: "/seed" },
  async () => {
    // Create sample users
    await userDB.exec`
      INSERT INTO users (id, email, name, role, phone) VALUES
      (1, 'parent1@example.com', 'Sarah Johnson', 'parent', '+1234567890'),
      (2, 'parent2@example.com', 'Michael Chen', 'parent', '+1234567891'),
      (3, 'driver1@example.com', 'Robert Smith', 'driver', '+1234567892'),
      (4, 'admin1@example.com', 'Lisa Anderson', 'admin', '+1234567893'),
      (5, 'operator1@example.com', 'David Wilson', 'operator', '+1234567894'),
      (6, 'demo-parent@example.com', 'Demo Parent', 'parent', '+1234567895'),
      (7, 'demo-driver@example.com', 'Demo Driver', 'driver', '+1234567896'),
      (8, 'demo-admin@example.com', 'Demo Admin', 'admin', '+1234567897'),
      (9, 'demo-operator@example.com', 'Demo Operator', 'operator', '+1234567898')
      ON CONFLICT (id) DO NOTHING
    `;

    // Create sample buses
    await busDB.exec`
      INSERT INTO buses (id, number, driver_id, capacity, status) VALUES
      (1, '123', 3, 50, 'active'),
      (2, '456', 7, 45, 'active'),
      (3, '789', NULL, 55, 'maintenance')
      ON CONFLICT (id) DO NOTHING
    `;

    // Create sample children
    await userDB.exec`
      INSERT INTO children (id, parent_id, name, school_id, bus_id, bus_stop_id) VALUES
      (1, 1, 'Emma Johnson', 1, 1, 1),
      (2, 1, 'Jake Johnson', 1, 1, 2),
      (3, 2, 'Lily Chen', 1, 2, 3),
      (4, 6, 'Demo Child 1', 1, 1, 1),
      (5, 6, 'Demo Child 2', 1, 2, 2)
      ON CONFLICT (id) DO NOTHING
    `;

    // Create sample routes
    await busDB.exec`
      INSERT INTO routes (id, name, bus_id, school_id, route_type, is_active) VALUES
      (1, 'Morning Route A', 1, 1, 'morning', true),
      (2, 'Afternoon Route A', 1, 1, 'afternoon', true),
      (3, 'Morning Route B', 2, 1, 'morning', true)
      ON CONFLICT (id) DO NOTHING
    `;

    // Create sample bus stops
    await busDB.exec`
      INSERT INTO bus_stops (id, route_id, name, latitude, longitude, stop_order, estimated_arrival_time) VALUES
      (1, 1, 'Maple Street & Oak Avenue', 40.7128, -74.0060, 1, '08:15:00'),
      (2, 1, 'Pine Street & Elm Avenue', 40.7138, -74.0070, 2, '08:20:00'),
      (3, 1, 'Cedar Street & Birch Avenue', 40.7148, -74.0080, 3, '08:25:00'),
      (4, 1, 'Oakwood Elementary School', 40.7158, -74.0090, 4, '08:30:00')
      ON CONFLICT (id) DO NOTHING
    `;

    // Create sample geofences
    await geofencingDB.exec`
      INSERT INTO geofences (id, name, type, latitude, longitude, radius_meters) VALUES
      (1, 'Oakwood Elementary School', 'school', 40.7158, -74.0090, 200),
      (2, 'Maple Street Stop', 'bus_stop', 40.7128, -74.0060, 50),
      (3, 'Pine Street Stop', 'bus_stop', 40.7138, -74.0070, 50),
      (4, 'Cedar Street Stop', 'bus_stop', 40.7148, -74.0080, 50),
      (5, 'Bus Depot', 'depot', 40.7100, -74.0050, 100)
      ON CONFLICT (id) DO NOTHING
    `;

    // Create sample bus locations
    await locationDB.exec`
      INSERT INTO bus_status (bus_id, current_latitude, current_longitude, status, eta_minutes, last_updated) VALUES
      (1, 40.7128, -74.0060, 'moving', 8, NOW()),
      (2, 40.7200, -74.0100, 'stopped', 15, NOW())
      ON CONFLICT (bus_id) DO UPDATE SET
        current_latitude = EXCLUDED.current_latitude,
        current_longitude = EXCLUDED.current_longitude,
        status = EXCLUDED.status,
        eta_minutes = EXCLUDED.eta_minutes,
        last_updated = EXCLUDED.last_updated
    `;

    // Create sample notifications
    await notificationDB.exec`
      INSERT INTO notifications (user_id, type, title, message, bus_id, is_read, sent_at) VALUES
      (1, 'bus_approaching', 'Bus Approaching', 'Bus 123 is 5 minutes away from your stop', 1, false, NOW() - INTERVAL '5 minutes'),
      (1, 'bus_arrived', 'Bus Arrived', 'Bus 123 has arrived at Maple Street & Oak Avenue', 1, true, NOW() - INTERVAL '2 hours'),
      (1, 'bus_delayed', 'Bus Delayed', 'Bus 123 is running 10 minutes late due to traffic', 1, true, NOW() - INTERVAL '1 day'),
      (2, 'route_changed', 'Route Change', 'Morning route has been updated due to construction', 2, false, NOW() - INTERVAL '3 hours'),
      (6, 'bus_approaching', 'Bus Approaching', 'Bus 123 is 3 minutes away from your stop', 1, false, NOW() - INTERVAL '3 minutes'),
      (6, 'bus_arrived', 'Bus Arrived', 'Bus 456 has arrived at Pine Street & Elm Avenue', 2, true, NOW() - INTERVAL '1 hour')
      ON CONFLICT DO NOTHING
    `;

    // Create sample performance metrics
    await analyticsDB.exec`
      INSERT INTO performance_metrics (metric_type, entity_type, entity_id, value, unit, date) VALUES
      ('on_time_rate', 'system', NULL, 94.2, 'percentage', CURRENT_DATE),
      ('fuel_efficiency', 'system', NULL, 8.5, 'mpg', CURRENT_DATE),
      ('incident_rate', 'system', NULL, 2.1, 'per_100_trips', CURRENT_DATE),
      ('route_completion', 'system', NULL, 98.7, 'percentage', CURRENT_DATE),
      ('on_time_rate', 'bus', 1, 96.5, 'percentage', CURRENT_DATE),
      ('on_time_rate', 'bus', 2, 91.8, 'percentage', CURRENT_DATE),
      ('fuel_efficiency', 'bus', 1, 9.2, 'mpg', CURRENT_DATE),
      ('fuel_efficiency', 'bus', 2, 7.8, 'mpg', CURRENT_DATE)
      ON CONFLICT (metric_type, entity_type, entity_id, date) DO UPDATE SET
        value = EXCLUDED.value,
        unit = EXCLUDED.unit
    `;

    return { message: "Sample data seeded successfully with enhanced features and demo accounts" };
  }
);
