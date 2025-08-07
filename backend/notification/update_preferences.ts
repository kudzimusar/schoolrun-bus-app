import { api } from "encore.dev/api";
import { notificationDB } from "./db";

export interface UpdatePreferencesRequest {
  userId: number;
  busApproaching?: boolean;
  busArrived?: boolean;
  busDelayed?: boolean;
  routeChanged?: boolean;
  emergency?: boolean;
  approachTimeMinutes?: number;
}

export interface NotificationPreferences {
  id: number;
  userId: number;
  busApproaching: boolean;
  busArrived: boolean;
  busDelayed: boolean;
  routeChanged: boolean;
  emergency: boolean;
  approachTimeMinutes: number;
  updatedAt: Date;
}

// Updates notification preferences for a user.
export const updatePreferences = api<UpdatePreferencesRequest, NotificationPreferences>(
  { expose: true, method: "PUT", path: "/notifications/preferences" },
  async (req) => {
    const preferences = await notificationDB.queryRow<NotificationPreferences>`
      INSERT INTO notification_preferences (
        user_id, bus_approaching, bus_arrived, bus_delayed, 
        route_changed, emergency, approach_time_minutes, updated_at
      )
      VALUES (
        ${req.userId}, 
        ${req.busApproaching ?? true}, 
        ${req.busArrived ?? true}, 
        ${req.busDelayed ?? true},
        ${req.routeChanged ?? true}, 
        ${req.emergency ?? true}, 
        ${req.approachTimeMinutes ?? 5}, 
        NOW()
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        bus_approaching = COALESCE(${req.busApproaching}, notification_preferences.bus_approaching),
        bus_arrived = COALESCE(${req.busArrived}, notification_preferences.bus_arrived),
        bus_delayed = COALESCE(${req.busDelayed}, notification_preferences.bus_delayed),
        route_changed = COALESCE(${req.routeChanged}, notification_preferences.route_changed),
        emergency = COALESCE(${req.emergency}, notification_preferences.emergency),
        approach_time_minutes = COALESCE(${req.approachTimeMinutes}, notification_preferences.approach_time_minutes),
        updated_at = NOW()
      RETURNING id, user_id as "userId", bus_approaching as "busApproaching", 
                bus_arrived as "busArrived", bus_delayed as "busDelayed",
                route_changed as "routeChanged", emergency, 
                approach_time_minutes as "approachTimeMinutes", updated_at as "updatedAt"
    `;
    
    if (!preferences) {
      throw new Error("Failed to update preferences");
    }
    
    return preferences;
  }
);
