import { api } from "encore.dev/api";
import { incidentDB } from "./db";

export interface ListIncidentsParams {
  status?: string;
  severity?: string;
  busId?: number;
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
  resolvedAt?: Date;
}

export interface ListIncidentsResponse {
  incidents: Incident[];
}

// Retrieves incidents with optional filtering.
export const listIncidents = api<ListIncidentsParams, ListIncidentsResponse>(
  { expose: true, method: "GET", path: "/incidents" },
  async (params) => {
    const incidents: Incident[] = [];
    
    let query = `
      SELECT id, bus_id as "busId", driver_id as "driverId", type, severity, 
             title, description, latitude, longitude, status, 
             reported_at as "reportedAt", resolved_at as "resolvedAt"
      FROM incidents 
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.status) {
      query += ` AND status = $${paramIndex}`;
      queryParams.push(params.status);
      paramIndex++;
    }
    
    if (params.severity) {
      query += ` AND severity = $${paramIndex}`;
      queryParams.push(params.severity);
      paramIndex++;
    }
    
    if (params.busId) {
      query += ` AND bus_id = $${paramIndex}`;
      queryParams.push(params.busId);
      paramIndex++;
    }
    
    query += ` ORDER BY reported_at DESC LIMIT 50`;
    
    for await (const incident of incidentDB.rawQuery<Incident>(query, ...queryParams)) {
      incidents.push(incident);
    }
    
    return { incidents };
  }
);
