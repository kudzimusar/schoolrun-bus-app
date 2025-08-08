import { Topic } from "encore.dev/pubsub";

export interface BusLocationEvent {
  busId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  status: "moving" | "stopped" | "delayed" | "off_route";
  timestamp: Date;
  geofenceEvents?: {
    geofenceName: string;
    eventType: string;
  }[];
}

export const busLocationUpdates = new Topic<BusLocationEvent>("bus-location-updates", {
  deliveryGuarantee: "at-least-once",
});