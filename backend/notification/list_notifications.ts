import { api, APIError } from "encore.dev/api";
import { notificationDB } from "./db";
import { userDB } from "../user/db";

export interface ListNotificationsParams {
  userId: number;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  busId?: number;
  isRead: boolean;
  sentAt: Date;
}

export interface ListNotificationsResponse {
  notifications: Notification[];
}

// Retrieves all notifications for a user.
export const listNotifications = api<ListNotificationsParams, ListNotificationsResponse>(
  { expose: true, auth: true, method: "GET", path: "/notifications/user/:userId" },
  async (params) => {
    const user = await userDB.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${params.userId}
    `;
    if (!user) throw APIError.notFound("user not found");

    const notifications: Notification[] = [];
    
    for await (const notification of notificationDB.query<Notification>`
      SELECT id, user_id as "userId", type, title, message, bus_id as "busId", 
             is_read as "isRead", sent_at as "sentAt"
      FROM notifications 
      WHERE user_id = ${params.userId}
      ORDER BY sent_at DESC
      LIMIT 50
    `) {
      notifications.push(notification);
    }
    
    return { notifications };
  }
);
