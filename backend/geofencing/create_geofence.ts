import { api } from "encore.dev/api";
import { geofencingDB } from "./db";

export interface CreateGeofenceRequest {
  name: string;
  type: "bus_stop" | "school" | "depot" | "custom";
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}

export interface Geofence {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new geofence area.
export const createGeofence = api<CreateGeofenceRequest, Geofence>(
  { expose: true, method: "POST", path: "/geofences" },
  async (req) => {
    const geofence = await geofencingDB.queryRow<Geofence>`
      INSERT INTO geofences (name, type, latitude, longitude, radius_meters)
      VALUES (${req.name}, ${req.type}, ${req.latitude}, ${req.longitude}, ${req.radiusMeters || 100})
      RETURNING id, name, type, latitude, longitude, radius_meters as "radiusMeters", 
                is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!geofence) {
      throw new Error("Failed to create geofence");
    }
    
    return geofence;
  }
);
