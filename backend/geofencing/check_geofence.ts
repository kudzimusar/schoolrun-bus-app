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
      isPolygon: boolean;
      polygonCoordinates: [number, number][] | null;
    }>`
      SELECT id, name, latitude, longitude, radius_meters as "radiusMeters",
             is_polygon as "isPolygon", polygon_coordinates as "polygonCoordinates"
      FROM geofences 
      WHERE is_active = true
    `;
    
    for (const geofence of geofences) {
      let isInside = false;
      
      if (geofence.isPolygon && geofence.polygonCoordinates) {
        isInside = isPointInPolygon(
          [req.latitude, req.longitude],
          geofence.polygonCoordinates
        );
      } else {
        const distance = calculateDistance(
          req.latitude, req.longitude,
          geofence.latitude, geofence.longitude
        );
        isInside = distance <= geofence.radiusMeters;
      }
      
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
import { calculateDistance } from "./distance";
export { calculateDistance };

/**
 * Ray-casting algorithm to check if a point is inside a polygon.
 * @param point [latitude, longitude]
 * @param polygon Array of [latitude, longitude] pairs
 */
function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
