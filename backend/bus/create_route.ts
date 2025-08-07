import { api } from "encore.dev/api";
import { busDB } from "./db";

export interface CreateRouteRequest {
  name: string;
  busId?: number;
  schoolId?: number;
  routeType: "morning" | "afternoon";
}

export interface Route {
  id: number;
  name: string;
  busId?: number;
  schoolId?: number;
  routeType: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new bus route.
export const createRoute = api<CreateRouteRequest, Route>(
  { expose: true, method: "POST", path: "/routes" },
  async (req) => {
    const route = await busDB.queryRow<Route>`
      INSERT INTO routes (name, bus_id, school_id, route_type)
      VALUES (${req.name}, ${req.busId}, ${req.schoolId}, ${req.routeType})
      RETURNING id, name, bus_id as "busId", school_id as "schoolId", 
                route_type as "routeType", is_active as "isActive",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!route) {
      throw new Error("Failed to create route");
    }
    
    return route;
  }
);
