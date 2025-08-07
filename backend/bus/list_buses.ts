import { api } from "encore.dev/api";
import { busDB } from "./db";

export interface Bus {
  id: number;
  number: string;
  driverId?: number;
  capacity: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListBusesResponse {
  buses: Bus[];
}

// Retrieves all buses in the fleet.
export const listBuses = api<void, ListBusesResponse>(
  { expose: true, method: "GET", path: "/buses" },
  async () => {
    const buses: Bus[] = [];
    
    for await (const bus of busDB.query<Bus>`
      SELECT id, number, driver_id as "driverId", capacity, status, 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM buses 
      ORDER BY number ASC
    `) {
      buses.push(bus);
    }
    
    return { buses };
  }
);
