import { api, APIError } from "encore.dev/api";
import { busDB } from "./db";

export interface GetRouteStopsParams {
  routeId: number;
}

export interface BusStop {
  id: number;
  routeId: number;
  name: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  estimatedArrivalTime?: string;
  createdAt: Date;
}

export interface GetRouteStopsResponse {
  stops: BusStop[];
}

// Retrieves all stops for a specific route.
export const getRouteStops = api<GetRouteStopsParams, GetRouteStopsResponse>(
  { expose: true, method: "GET", path: "/routes/:routeId/stops" },
  async (params) => {
    const stops: BusStop[] = [];
    
    for await (const stop of busDB.query<BusStop>`
      SELECT id, route_id as "routeId", name, latitude, longitude, 
             stop_order as "stopOrder", estimated_arrival_time as "estimatedArrivalTime",
             created_at as "createdAt"
      FROM bus_stops 
      WHERE route_id = ${params.routeId}
      ORDER BY stop_order ASC
    `) {
      stops.push(stop);
    }
    
    return { stops };
  }
);
