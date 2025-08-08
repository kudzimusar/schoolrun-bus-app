import { api } from "encore.dev/api";
import { notificationDB } from "./db";

export interface MarkAsReadRequest {
  notificationId: number;
}

// Marks a notification as read.
export const markAsRead = api<MarkAsReadRequest, void>(
  { expose: true, auth: true, method: "PUT", path: "/notifications/:notificationId/read" },
  async (req) => {
    await notificationDB.exec`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = ${req.notificationId}
    `;
  }
);
