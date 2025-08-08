import { api } from "encore.dev/api";
import { incidentDB } from "./db";

export interface UpdateIncidentRequest {
  incidentId: number;
  status?: "open" | "in_progress" | "resolved" | "closed";
  description?: string;
}

export interface Incident {
  id: number;
  busId: number;
  driverId: number;
  type: string;
  severity: string;
  title: string;
  description?: string;
  status: string;
  reportedAt: Date;
  resolvedAt?: Date;
  updatedAt: Date;
}

// Updates an incident status or details.
export const updateIncident = api<UpdateIncidentRequest, Incident>(
  { expose: true, method: "PUT", path: "/incidents/:incidentId" },
  async (req) => {
    const resolvedAt = req.status === 'resolved' || req.status === 'closed' ? 'NOW()' : 'resolved_at';
    
    const incident = await incidentDB.queryRow<Incident>`
      UPDATE incidents 
      SET 
        status = COALESCE(${req.status}, status),
        description = COALESCE(${req.description}, description),
        resolved_at = CASE WHEN ${req.status} IN ('resolved', 'closed') THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
      WHERE id = ${req.incidentId}
      RETURNING id, bus_id as "busId", driver_id as "driverId", type, severity, 
                title, description, status, reported_at as "reportedAt", 
                resolved_at as "resolvedAt", updated_at as "updatedAt"
    `;
    
    if (!incident) {
      throw new Error("Incident not found or failed to update");
    }
    
    return incident;
  }
);
