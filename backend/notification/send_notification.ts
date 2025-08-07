import { api } from "encore.dev/api";
import { notificationDB } from "./db";

export interface SendNotificationRequest {
  userId: number;
  type: "bus_approaching" | "bus_arrived" | "bus_delayed" | "route_changed" | "emergency";
  title: string;
  message: string;
  busId?: number;
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

// Sends a notification to a user.
export const sendNotification = api<SendNotificationRequest, Notification>(
  { expose: true, method: "POST", path: "/notifications/send" },
  async (req) => {
    const notification = await notificationDB.queryRow<Notification>`
      INSERT INTO notifications (user_id, type, title, message, bus_id)
      VALUES (${req.userId}, ${req.type}, ${req.title}, ${req.message}, ${req.busId})
      RETURNING id, user_id as "userId", type, title, message, bus_id as "busId", 
                is_read as "isRead", sent_at as "sentAt"
    `;
    
    if (!notification) {
      throw new Error("Failed to send notification");
    }
    
    // Here you would integrate with push notification services (FCM/APNs)
    // For now, we just store the notification in the database
    
    return notification;
  }
);
