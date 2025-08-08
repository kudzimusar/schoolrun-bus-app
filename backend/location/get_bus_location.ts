import { api, APIError } from "encore.dev/api";
import { locationDB } from "./db";

export interface GetBusLocationParams {
  busId: number;
}

export interface BusLocation {
  busId: number;
  latitude: number;
  longitude: number;
  status: string;
  etaMinutes?: number;
  lastUpdated: Date;
}

// Retrieves the current location and status of a bus.
export const getBusLocation = api<GetBusLocationParams, BusLocation>(
  { expose: true, auth: true, method: "GET", path: "/location/bus/:busId" },
  async (params) => {
    const location = await locationDB.queryRow<BusLocation>`
      SELECT bus_id as "busId", current_latitude as "latitude", 
             current_longitude as "longitude", status, eta_minutes as "etaMinutes",
             last_updated as "lastUpdated"
      FROM bus_status 
      WHERE bus_id = ${params.busId}
    `;
    
    if (!location) {
      throw APIError.notFound("bus location not found");
    }
    
    return location;
  }
);
