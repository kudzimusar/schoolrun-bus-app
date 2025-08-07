import { api } from "encore.dev/api";
import { locationDB } from "./db";

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
}

// Updates the real-time location of a bus.
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
    
    // Update or insert current status
    await locationDB.exec`
      INSERT INTO bus_status (bus_id, current_latitude, current_longitude, status, last_updated)
      VALUES (${req.busId}, ${req.latitude}, ${req.longitude}, 'moving', NOW())
      ON CONFLICT (bus_id) 
      DO UPDATE SET 
        current_latitude = EXCLUDED.current_latitude,
        current_longitude = EXCLUDED.current_longitude,
        status = EXCLUDED.status,
        last_updated = EXCLUDED.last_updated
    `;
    
    return location;
  }
);
