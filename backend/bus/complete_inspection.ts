import { api, APIError } from "encore.dev/api";
import { busDB } from "./db";

export interface InspectionRequest {
  busId: number;
  driverId: number;
  inspectionType: "post_trip_check" | "pre_trip_check";
  notes?: string;
}

export interface InspectionResponse {
  id: number;
  completedAt: string;
}

// Records a completed safety inspection.
export const completeInspection = api<InspectionRequest, InspectionResponse>(
  { expose: true, method: "POST", path: "/bus/inspection" },
  async (req) => {
    const row = await busDB.queryRow<{ id: number; completed_at: string }>`
      INSERT INTO safety_inspections (bus_id, driver_id, inspection_type, notes)
      VALUES (${req.busId}, ${req.driverId}, ${req.inspectionType}, ${req.notes})
      RETURNING id, completed_at::text
    `;

    if (!row) {
      throw new Error("failed to record inspection");
    }

    return {
      id: row.id,
      completedAt: row.completed_at,
    };
  }
);
