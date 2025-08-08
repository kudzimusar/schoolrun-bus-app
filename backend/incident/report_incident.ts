import { api } from "encore.dev/api";
import { incidentDB } from "./db";

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

// Reports a new incident from a bus driver.
export const reportIncident = api<ReportIncidentRequest, Incident>(
  { expose: true, method: "POST", path: "/incidents" },
  async (req) => {
    const incident = await incidentDB.queryRow<Incident>`
      INSERT INTO incidents (
        bus_id, driver_id, type, severity, title, description, latitude, longitude
      )
      VALUES (
        ${req.busId}, ${req.driverId}, ${req.type}, ${req.severity}, 
        ${req.title}, ${req.description}, ${req.latitude}, ${req.longitude}
      )
      RETURNING id, bus_id as "busId", driver_id as "driverId", type, severity, 
                title, description, latitude, longitude, status, 
                reported_at as "reportedAt", created_at as "createdAt"
    `;
    
    if (!incident) {
      throw new Error("Failed to report incident");
    }
    
    // TODO: Trigger notifications to administrators and affected parents
    
    return incident;
  }
);
