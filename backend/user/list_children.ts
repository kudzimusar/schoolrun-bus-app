import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";

export interface ListChildrenParams {
  parentId: number;
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

export interface ListChildrenResponse {
  children: Child[];
}

// Retrieves all children for a parent.
export const listChildren = api<ListChildrenParams, ListChildrenResponse>(
  { expose: true, auth: true, method: "GET", path: "/users/:parentId/children" },
  async (params, _req?: unknown, auth?: any) => {
    const parent = await userDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${params.parentId}
    `;
    if (!parent) throw APIError.notFound("parent not found");

    // Enforce caller ownership unless admin
    const callerId = (auth?.data as any)?.userId as number | undefined;
    const callerRole = (auth?.data as any)?.roles?.[0] || parent.role;
    if (callerRole !== "admin" && callerId !== params.parentId) {
      throw APIError.permissionDenied("cannot view other user's children");
    }

    const children: Child[] = [];
    
    for await (const child of userDB.query<Child>`
      SELECT id, parent_id as "parentId", name, school_id as "schoolId", 
             bus_id as "BusId", bus_stop_id as "busStopId", created_at as "createdAt"
      FROM children 
      WHERE parent_id = ${params.parentId}
      ORDER BY created_at ASC
    `) {
      children.push(child);
    }
    
    return { children };
  }
);
