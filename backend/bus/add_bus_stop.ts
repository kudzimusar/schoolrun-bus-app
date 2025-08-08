import { api } from "encore.dev/api";
import { busDB } from "./db";

export interface AddBusStopRequest {
  routeId: number;
  name: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  estimatedArrivalTime?: string;
  landmarkDescription?: string;
}

export interface BusStop {
  id: number;
  routeId: number;
  name: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  estimatedArrivalTime?: string;
  landmarkDescription?: string;
  createdAt: Date;
}

// Adds a bus stop to a route.
export const addBusStop = api<AddBusStopRequest, BusStop>(
  { expose: true, method: "POST", path: "/routes/stops" },
  async (req) => {
    const busStop = await busDB.queryRow<BusStop>`
      INSERT INTO bus_stops (route_id, name, latitude, longitude, stop_order, estimated_arrival_time, landmark_description)
      VALUES (${req.routeId}, ${req.name}, ${req.latitude}, ${req.longitude}, 
              ${req.stopOrder}, ${req.estimatedArrivalTime}, ${req.landmarkDescription})
      RETURNING id, route_id as "routeId", name, latitude, longitude, 
                stop_order as "stopOrder", estimated_arrival_time as "estimatedArrivalTime",
                landmark_description as "landmarkDescription",
                created_at as "createdAt"
    `;
    
    if (!busStop) {
      throw new Error("Failed to add bus stop");
    }
    
    return busStop;
  }
);
