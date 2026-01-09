import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";

export interface LogActivityRequest {
  studentId: number;
  busId: number;
  action: "boarded" | "exited";
}

export interface LogActivityResponse {
  id: number;
  loggedAt: string;
}

// Records a student boarding or exiting the bus.
export const logStudentActivity = api<LogActivityRequest, LogActivityResponse>(
  { expose: true, method: "POST", path: "/user/student/log" },
  async (req) => {
    const row = await userDB.queryRow<{ id: number; logged_at: string }>`
      INSERT INTO student_logs (student_id, bus_id, action)
      VALUES (${req.studentId}, ${req.busId}, ${req.action})
      RETURNING id, logged_at::text
    `;

    if (!row) {
      throw new Error("failed to record student activity");
    }

    return {
      id: row.id,
      loggedAt: row.logged_at,
    };
  }
);
