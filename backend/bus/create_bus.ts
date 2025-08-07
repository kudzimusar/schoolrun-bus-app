import { api } from "encore.dev/api";
import { busDB } from "./db";

export interface CreateBusRequest {
  number: string;
  driverId?: number;
  capacity?: number;
}

export interface Bus {
  id: number;
  number: string;
  driverId?: number;
  capacity: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new bus in the fleet.
export const createBus = api<CreateBusRequest, Bus>(
  { expose: true, method: "POST", path: "/buses" },
  async (req) => {
    const bus = await busDB.queryRow<Bus>`
      INSERT INTO buses (number, driver_id, capacity)
      VALUES (${req.number}, ${req.driverId}, ${req.capacity || 50})
      RETURNING id, number, driver_id as "driverId", capacity, status, 
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!bus) {
      throw new Error("Failed to create bus");
    }
    
    return bus;
  }
);
