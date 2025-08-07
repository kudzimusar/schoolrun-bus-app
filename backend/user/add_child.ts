import { api } from "encore.dev/api";
import { userDB } from "./db";

export interface AddChildRequest {
  parentId: number;
  name: string;
  schoolId?: number;
  busId?: number;
  busStopId?: number;
}

export interface Child {
  id: number;
  parentId: number;
  name: string;
  schoolId?: number;
  busId?: number;
  busStopId?: number;
  createdAt: Date;
}

// Adds a child to a parent's account.
export const addChild = api<AddChildRequest, Child>(
  { expose: true, method: "POST", path: "/users/children" },
  async (req) => {
    const child = await userDB.queryRow<Child>`
      INSERT INTO children (parent_id, name, school_id, bus_id, bus_stop_id)
      VALUES (${req.parentId}, ${req.name}, ${req.schoolId}, ${req.busId}, ${req.busStopId})
      RETURNING id, parent_id as "parentId", name, school_id as "schoolId", 
                bus_id as "busId", bus_stop_id as "busStopId", created_at as "createdAt"
    `;
    
    if (!child) {
      throw new Error("Failed to add child");
    }
    
    return child;
  }
);
