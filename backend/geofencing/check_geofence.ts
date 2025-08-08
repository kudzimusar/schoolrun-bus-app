import { api } from "encore.dev/api";
import { geofencingDB } from "./db";

export interface CheckGeofenceRequest {
  busId: number;
  latitude: number;
  longitude: number;
}

export interface GeofenceEvent {
  id: number;
  busId: number;
  geofenceId: number;
  geofenceName: string;
  eventType: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface CheckGeofenceResponse {
  events: GeofenceEvent[];
}

// Checks if a bus location triggers any geofence events.
export const checkGeofence = api<CheckGeofenceRequest, CheckGeofenceResponse>(
  { expose: true, method: "POST", path: "/geofences/check" },
  async (req) => {
    const events: GeofenceEvent[] = [];
    
    // Calculate distance using Haversine formula for all active geofences
    const geofences = await geofencingDB.queryAll<{
      id: number;
      name: string;
      latitude: number;
      longitude: number;
      radiusMeters: number;
    }>`
      SELECT id, name, latitude, longitude, radius_meters as "radiusMeters"
      FROM geofences 
      WHERE is_active = true
    `;
    
    for (const geofence of geofences) {
      const distance = calculateDistance(
        req.latitude, req.longitude,
        geofence.latitude, geofence.longitude
      );
      
      const isInside = distance <= geofence.radiusMeters;
      
      // Check if bus was previously inside this geofence
      const lastEvent = await geofencingDB.queryRow<{ eventType: string }>`
        SELECT event_type as "eventType"
        FROM geofence_events 
        WHERE bus_id = ${req.busId} AND geofence_id = ${geofence.id}
        ORDER BY timestamp DESC 
        LIMIT 1
      `;
      
      const wasInside = lastEvent?.eventType === 'enter';
      
      // Trigger event if status changed
      if (isInside && !wasInside) {
        // Bus entered geofence
        const event = await geofencingDB.queryRow<GeofenceEvent>`
          INSERT INTO geofence_events (bus_id, geofence_id, event_type, latitude, longitude)
          VALUES (${req.busId}, ${geofence.id}, 'enter', ${req.latitude}, ${req.longitude})
          RETURNING id, bus_id as "busId", geofence_id as "geofenceId", 
                    event_type as "eventType", latitude, longitude, timestamp
        `;
        
        if (event) {
          events.push({
            ...event,
            geofenceName: geofence.name,
          });
        }
      } else if (!isInside && wasInside) {
        // Bus exited geofence
        const event = await geofencingDB.queryRow<GeofenceEvent>`
          INSERT INTO geofence_events (bus_id, geofence_id, event_type, latitude, longitude)
          VALUES (${req.busId}, ${geofence.id}, 'exit', ${req.latitude}, ${req.longitude})
          RETURNING id, bus_id as "busId", geofence_id as "geofenceId", 
                    event_type as "eventType", latitude, longitude, timestamp
        `;
        
        if (event) {
          events.push({
            ...event,
            geofenceName: geofence.name,
          });
        }
      }
    }
    
    return { events };
  }
);

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
