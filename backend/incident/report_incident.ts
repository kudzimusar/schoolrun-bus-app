import { api, APIError } from "encore.dev/api";
import { incidentDB } from "./db";
import { userDB } from "../user/db";
import { secret } from "encore.dev/config";

const MapboxAccessToken = secret("MapboxAccessToken");

export interface ReportIncidentRequest {
  busId: number;
  driverId: number;
  type: "delay" | "breakdown" | "accident" | "emergency" | "route_deviation" | "other";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface Incident {
  id: number;
  busId: number;
  driverId: number;
  type: string;
  severity: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  reportedAt: Date;
  createdAt: Date;
}

async function reverseGeocode(lat?: number, lon?: number): Promise<string | undefined> {
  const token = MapboxAccessToken();
  if (!token || lat === undefined || lon === undefined) return undefined;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${token}`;
  const resp = await fetch(url);
  if (!resp.ok) return undefined;
  const data: any = await resp.json();
  const place = data?.features?.[0]?.place_name as string | undefined;
  return place;
}

// Reports a new incident from a bus driver.
export const reportIncident = api<ReportIncidentRequest, Incident>(
  { expose: true, auth: true, method: "POST", path: "/incidents" },
  async (req) => {
    const caller = await userDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${req.driverId}
    `;
    if (!caller || (caller.role !== "driver" && caller.role !== "admin")) {
      throw APIError.permissionDenied("only drivers or admins can report incidents");
    }

    const locationName = await reverseGeocode(req.latitude, req.longitude).catch(() => undefined);

    const incident = await incidentDB.queryRow<Incident>`
      INSERT INTO incidents (
        bus_id, driver_id, type, severity, title, description, latitude, longitude, location_name
      )
      VALUES (
        ${req.busId}, ${req.driverId}, ${req.type}, ${req.severity}, 
        ${req.title}, ${req.description}, ${req.latitude}, ${req.longitude}, ${locationName}
      )
      RETURNING id, bus_id as "busId", driver_id as "driverId", type, severity, 
                title, description, latitude, longitude, status, 
                reported_at as "reportedAt", created_at as "createdAt"
    `;
    
    if (!incident) {
      throw new Error("Failed to report incident");
    }
    
    return incident;
  }
);
