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
    // Create sample users with Zimbabwe-specific data
    await userDB.exec`
      INSERT INTO users (id, email, name, role, phone, wallet_balance_usd, wallet_balance_zwl) VALUES
      (1, 'parent1@example.com', 'Sarah Johnson', 'parent', '+263771234567', 25.00, 5000.00),
      (2, 'parent2@example.com', 'Michael Chen', 'parent', '+263772345678', 15.50, 3200.00),
      (3, 'driver1@example.com', 'Robert Smith', 'driver', '+263773456789', 0.00, 0.00),
      (4, 'admin1@example.com', 'Lisa Anderson', 'admin', '+263774567890', 0.00, 0.00),
      (5, 'operator1@example.com', 'David Wilson', 'operator', '+263775678901', 0.00, 0.00),
      (6, 'demo-parent@example.com', 'Demo Parent', 'parent', '+263776789012', 50.00, 12000.00),
      (7, 'demo-driver@example.com', 'Demo Driver', 'driver', '+263777890123', 0.00, 0.00),
      (8, 'demo-admin@example.com', 'Demo Admin', 'admin', '+263778901234', 0.00, 0.00),
      (9, 'demo-operator@example.com', 'Demo Operator', 'operator', '+263779012345', 0.00, 0.00)
      ON CONFLICT (id) DO UPDATE SET
        wallet_balance_usd = EXCLUDED.wallet_balance_usd,
        wallet_balance_zwl = EXCLUDED.wallet_balance_zwl,
        phone = EXCLUDED.phone,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        email = EXCLUDED.email
    `;

    // Create sample buses with Zimbabwe license plates
    await busDB.exec`
      INSERT INTO buses (id, number, driver_id, capacity, status) VALUES
      (1, 'ABC-123H', 3, 50, 'active'),
      (2, 'DEF-456H', 7, 45, 'active'),
      (3, 'GHI-789H', NULL, 55, 'maintenance')
      ON CONFLICT (id) DO UPDATE SET
        number = EXCLUDED.number,
        driver_id = EXCLUDED.driver_id,
        capacity = EXCLUDED.capacity,
        status = EXCLUDED.status
    `;

    // Create sample children
    await userDB.exec`
      INSERT INTO children (id, parent_id, name, school_id, bus_id, bus_stop_id) VALUES
      (1, 1, 'Emma Johnson', 1, 1, 1),
      (2, 1, 'Jake Johnson', 1, 1, 2),
      (3, 2, 'Lily Chen', 1, 2, 3),
      (4, 6, 'Demo Child 1', 1, 1, 1),
      (5, 6, 'Demo Child 2', 1, 2, 2)
      ON CONFLICT (id) DO UPDATE SET
        parent_id = EXCLUDED.parent_id,
        name = EXCLUDED.name,
        school_id = EXCLUDED.school_id,
        bus_id = EXCLUDED.bus_id,
        bus_stop_id = EXCLUDED.bus_stop_id
    `;

    // Create sample routes with Harare locations
    await busDB.exec`
      INSERT INTO routes (id, name, bus_id, school_id, route_type, is_active) VALUES
      (1, 'Avondale to Borrowdale School - Morning', 1, 1, 'morning', true),
      (2, 'Borrowdale School to Avondale - Afternoon', 1, 1, 'afternoon', true),
      (3, 'Mount Pleasant to Highlands School - Morning', 2, 1, 'morning', true)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        bus_id = EXCLUDED.bus_id,
        route_type = EXCLUDED.route_type,
        is_active = EXCLUDED.is_active
    `;

    // Create sample bus stops with Harare landmarks
    await busDB.exec`
      INSERT INTO bus_stops (id, route_id, name, latitude, longitude, stop_order, estimated_arrival_time, landmark_description) VALUES
      (1, 1, 'Avondale Shopping Centre', -17.8047, 31.0669, 1, '07:15:00', 'Next to Pick n Pay Avondale'),
      (2, 1, 'Sam Levy Village', -17.7833, 31.0833, 2, '07:25:00', 'Main entrance near the blue church'),
      (3, 1, 'Borrowdale Village', -17.7667, 31.1000, 3, '07:35:00', 'By the traffic lights near Chicken Inn'),
      (4, 1, 'Borrowdale School', -17.7500, 31.1167, 4, '07:45:00', 'Main school gate'),
      (5, 3, 'Mount Pleasant Heights', -17.7833, 31.0500, 1, '07:20:00', 'Near the water tower'),
      (6, 3, 'Highlands Primary School', -17.7667, 31.0667, 2, '07:40:00', 'School main entrance')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        landmark_description = EXCLUDED.landmark_description
    `;

    // Create sample geofences for Harare locations
    await geofencingDB.exec`
      INSERT INTO geofences (id, name, type, latitude, longitude, radius_meters) VALUES
      (1, 'Borrowdale School', 'school', -17.7500, 31.1167, 200),
      (2, 'Highlands Primary School', 'school', -17.7667, 31.0667, 200),
      (3, 'Avondale Shopping Centre Stop', 'bus_stop', -17.8047, 31.0669, 50),
      (4, 'Sam Levy Village Stop', 'bus_stop', -17.7833, 31.0833, 50),
      (5, 'Borrowdale Village Stop', 'bus_stop', -17.7667, 31.1000, 50),
      (6, 'Mount Pleasant Heights Stop', 'bus_stop', -17.7833, 31.0500, 50),
      (7, 'Harare Bus Depot', 'depot', -17.8292, 31.0522, 100)
      ON CONFLICT (id) DO UPDATE SET
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        radius_meters = EXCLUDED.radius_meters
    `;

    // Create sample bus locations in Harare
    await locationDB.exec`
      INSERT INTO bus_status (bus_id, current_latitude, current_longitude, status, eta_minutes, last_updated) VALUES
      (1, -17.8047, 31.0669, 'moving', 8, NOW()),
      (2, -17.7833, 31.0500, 'stopped', 15, NOW())
      ON CONFLICT (bus_id) DO UPDATE SET
        current_latitude = EXCLUDED.current_latitude,
        current_longitude = EXCLUDED.current_longitude,
        status = EXCLUDED.status,
        eta_minutes = EXCLUDED.eta_minutes,
        last_updated = EXCLUDED.last_updated
    `;

    // Create sample notifications with Zimbabwe context
    await notificationDB.exec`
      INSERT INTO notifications (user_id, type, title, message, bus_id, is_read, sent_at) VALUES
      (1, 'bus_approaching', 'Bus Approaching', 'Bus ABC-123H is 5 minutes away from Avondale Shopping Centre', 1, false, NOW() - INTERVAL '5 minutes'),
      (1, 'bus_arrived', 'Bus Arrived', 'Bus ABC-123H has arrived at Sam Levy Village', 1, true, NOW() - INTERVAL '2 hours'),
      (1, 'bus_delayed', 'Bus Delayed', 'Bus ABC-123H is running 10 minutes late due to traffic on Enterprise Road', 1, true, NOW() - INTERVAL '1 day'),
      (2, 'route_changed', 'Route Change', 'Morning route has been updated due to construction on Borrowdale Road', 2, false, NOW() - INTERVAL '3 hours'),
      (6, 'bus_approaching', 'Bus Approaching', 'Bus ABC-123H is 3 minutes away from your stop', 1, false, NOW() - INTERVAL '3 minutes'),
      (6, 'bus_arrived', 'Bus Arrived', 'Bus DEF-456H has arrived at Mount Pleasant Heights', 2, true, NOW() - INTERVAL '1 hour')
      ON CONFLICT DO NOTHING
    `;

    // Create sample performance metrics
    await analyticsDB.exec`
      INSERT INTO performance_metrics (metric_type, entity_type, entity_id, value, unit, date) VALUES
      ('on_time_rate', 'system', NULL, 89.5, 'percentage', CURRENT_DATE),
      ('fuel_efficiency', 'system', NULL, 7.2, 'km_per_litre', CURRENT_DATE),
      ('incident_rate', 'system', NULL, 3.8, 'per_100_trips', CURRENT_DATE),
      ('route_completion', 'system', NULL, 96.3, 'percentage', CURRENT_DATE),
      ('on_time_rate', 'bus', 1, 92.1, 'percentage', CURRENT_DATE),
      ('on_time_rate', 'bus', 2, 86.7, 'percentage', CURRENT_DATE),
      ('fuel_efficiency', 'bus', 1, 7.8, 'km_per_litre', CURRENT_DATE),
      ('fuel_efficiency', 'bus', 2, 6.9, 'km_per_litre', CURRENT_DATE)
      ON CONFLICT (metric_type, entity_type, entity_id, date) DO UPDATE SET
        value = EXCLUDED.value,
        unit = EXCLUDED.unit
    `;

    return { message: "Sample data seeded successfully with Zimbabwe-specific features, Harare locations, and enhanced demo accounts" };
  }
);
