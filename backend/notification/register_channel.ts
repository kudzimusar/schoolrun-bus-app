import { api, APIError } from "encore.dev/api";
import { notificationDB } from "./db";

export interface RegisterChannelRequest {
  userId: number;
  channel: "fcm" | "sms" | "email";
  identifier: string; // fcm token, phone number, or email
  platform?: string;  // web/ios/android for fcm
}

export interface RegisterChannelResponse {
  id: number;
  userId: number;
  channel: string;
  identifier: string;
  platform?: string;
  isActive: boolean;
}

export const registerChannel = api<RegisterChannelRequest, RegisterChannelResponse>(
  { expose: true, method: "POST", path: "/notifications/channels/register" },
  async (req) => {
    const row = await notificationDB.queryRow<RegisterChannelResponse>`
      INSERT INTO notification_channels (user_id, channel, identifier, platform)
      VALUES (${req.userId}, ${req.channel}, ${req.identifier}, ${req.platform})
      ON CONFLICT (channel, identifier)
      DO UPDATE SET user_id = EXCLUDED.user_id, platform = COALESCE(EXCLUDED.platform, notification_channels.platform), is_active = true, updated_at = NOW()
      RETURNING id, user_id as "userId", channel, identifier, platform, is_active as "isActive"
    `;

    if (!row) throw new Error("failed to register channel");
    return row;
  }
);

export const unregisterChannel = api<{ channel: "fcm" | "sms" | "email"; identifier: string }, { ok: true }>(
  { expose: true, method: "POST", path: "/notifications/channels/unregister" },
  async ({ channel, identifier }) => {
    const res = await notificationDB.exec`
      UPDATE notification_channels SET is_active = false, updated_at = NOW()
      WHERE channel = ${channel} AND identifier = ${identifier}
    `;
    // res has no rowcount API; we simply return ok
    return { ok: true };
  }
);