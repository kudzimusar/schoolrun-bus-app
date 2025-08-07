import { api } from "encore.dev/api";
import { locationDB } from "./db";

export interface BusLocation {
  busId: number;
  latitude: number;
  longitude: number;
  status: string;
  etaMinutes?: number;
  lastUpdated: Date;
}

export interface ListAllLocationsResponse {
  locations: BusLocation[];
}

// Retrieves current locations of all active buses.
export const listAllLocations = api<void, ListAllLocationsResponse>(
  { expose: true, method: "GET", path: "/location/all" },
  async () => {
    const locations: BusLocation[] = [];
    
    for await (const location of locationDB.query<BusLocation>`
      SELECT bus_id as "busId", current_latitude as "latitude", 
             current_longitude as "longitude", status, eta_minutes as "etaMinutes",
             last_updated as "lastUpdated"
      FROM bus_status 
      WHERE last_updated > NOW() - INTERVAL '1 hour'
      ORDER BY last_updated DESC
    `) {
      locations.push(location);
    }
    
    return { locations };
  }
);
