import { api } from "encore.dev/api";
import { locationDB } from "./db";
import { checkGeofence } from "../geofencing/check_geofence";
import type { GeofenceEvent } from "../geofencing/check_geofence";

export interface UpdateLocationRequest {
  busId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}

export interface LocationUpdate {
  id: number;
  busId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
  geofenceEvents?: {
    geofenceName: string;
    eventType: string;
  }[];
}

// Updates the real-time location of a bus and checks for geofence events.
export const updateLocation = api<UpdateLocationRequest, LocationUpdate>(
  { expose: true, method: "POST", path: "/location/update" },
  async (req) => {
    // Insert new location record
    const location = await locationDB.queryRow<LocationUpdate>`
      INSERT INTO bus_locations (bus_id, latitude, longitude, speed, heading)
      VALUES (${req.busId}, ${req.latitude}, ${req.longitude}, ${req.speed}, ${req.heading})
      RETURNING id, bus_id as "busId", latitude, longitude, speed, heading, timestamp
    `;
    
    if (!location) {
      throw new Error("Failed to update location");
    }
    
    // Determine bus status based on speed
    let status = 'stopped';
    if (req.speed && req.speed > 5) {
      status = 'moving';
    }
    
    // Update or insert current status
    await locationDB.exec`
      INSERT INTO bus_status (bus_id, current_latitude, current_longitude, status, last_updated)
      VALUES (${req.busId}, ${req.latitude}, ${req.longitude}, ${status}, NOW())
      ON CONFLICT (bus_id) 
      DO UPDATE SET 
        current_latitude = EXCLUDED.current_latitude,
        current_longitude = EXCLUDED.current_longitude,
        status = EXCLUDED.status,
        last_updated = EXCLUDED.last_updated
    `;
    
    // Check for geofence events
    try {
      const geofenceResult = await checkGeofence({
        busId: req.busId,
        latitude: req.latitude,
        longitude: req.longitude,
      });
      
      if (geofenceResult.events.length > 0) {
        location.geofenceEvents = geofenceResult.events.map((event: GeofenceEvent) => ({
          geofenceName: event.geofenceName,
          eventType: event.eventType,
        }));
      }
    } catch (error) {
      console.error("Failed to check geofences:", error);
      // Continue without geofence events if service is unavailable
    }
    
    return location;
  }
);
