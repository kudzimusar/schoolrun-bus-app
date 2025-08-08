import { api } from "encore.dev/api";
import { busDB } from "./db";

export interface Route {
  id: number;
  name: string;
  busId?: number;
  busNumber?: string;
  schoolId?: number;
  routeType: string;
  isActive: boolean;
  stopCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListRoutesResponse {
  routes: Route[];
}

// Retrieves all bus routes with stop counts.
export const listRoutes = api<void, ListRoutesResponse>(
  { expose: true, method: "GET", path: "/routes" },
  async () => {
    const routes: Route[] = [];
    
    for await (const route of busDB.query<Route>`
      SELECT 
        r.id, r.name, r.bus_id as "busId", b.number as "busNumber",
        r.school_id as "schoolId", r.route_type as "routeType", 
        r.is_active as "isActive", r.created_at as "createdAt", 
        r.updated_at as "updatedAt",
        COALESCE(stop_counts.count, 0) as "stopCount"
      FROM routes r
      LEFT JOIN buses b ON r.bus_id = b.id
      LEFT JOIN (
        SELECT route_id, COUNT(*) as count 
        FROM bus_stops 
        GROUP BY route_id
      ) stop_counts ON r.id = stop_counts.route_id
      ORDER BY r.name ASC
    `) {
      routes.push(route);
    }
    
    return { routes };
  }
);
