import { api, APIError } from "encore.dev/api";
import { notificationDB } from "./db";
import { secret } from "encore.dev/config";
import log from "encore.dev/log";

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

const FCMServerKey = secret("FCMServerKey");
const TwilioAccountSID = secret("TwilioAccountSID");
const TwilioAuthToken = secret("TwilioAuthToken");
const TwilioFromNumber = secret("TwilioFromNumber");
const ResendAPIKey = secret("ResendAPIKey");
const ResendFromEmail = secret("ResendFromEmail");

async function sendFCM(tokens: string[], title: string, body: string) {
  const key = FCMServerKey();
  if (!key || tokens.length === 0) return;
  try {
    await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${key}`,
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: { title, body },
      }),
    });
  } catch (err) {
    log.error("FCM send error", { err: String(err) });
  }
}

async function sendSMS(numbers: string[], body: string) {
  const sid = TwilioAccountSID();
  const token = TwilioAuthToken();
  const from = TwilioFromNumber();
  if (!sid || !token || !from || numbers.length === 0) return;
  for (const to of numbers) {
    try {
      const creds = btoa(`${sid}:${token}`);
      const params = new URLSearchParams({ To: to, From: from, Body: body });
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
    } catch (err) {
      log.error("Twilio SMS error", { err: String(err) });
    }
  }
}

async function sendEmail(emails: string[], subject: string, body: string) {
  const apiKey = ResendAPIKey();
  const from = ResendFromEmail();
  if (!apiKey || !from || emails.length === 0) return;
  for (const to of emails) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ from, to, subject, html: `<p>${body}</p>` }),
      });
    } catch (err) {
      log.error("Resend email error", { err: String(err) });
    }
  }
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

    // Load active channels
    const channels = await notificationDB.queryAll<{ channel: string; identifier: string }>`
      SELECT channel, identifier FROM notification_channels
      WHERE user_id = ${req.userId} AND is_active = true
    `;

    const fcmTokens = channels.filter(c => c.channel === "fcm").map(c => c.identifier);
    const smsNumbers = channels.filter(c => c.channel === "sms").map(c => c.identifier);
    const emails = channels.filter(c => c.channel === "email").map(c => c.identifier);

    await Promise.all([
      sendFCM(fcmTokens, req.title, req.message),
      sendSMS(smsNumbers, `${req.title}: ${req.message}`),
      sendEmail(emails, req.title, req.message),
    ]);
    
    return notification;
  }
);
