import { api, StreamOut } from "encore.dev/api";
import { Subscription } from "encore.dev/pubsub";
import { busLocationUpdates, type BusLocationEvent } from "./events";

// Maintain a set of connected streams to broadcast updates
const clients: Set<StreamOut<BusLocationEvent>> = new Set();

export const liveBusLocations = api.streamOut<void, BusLocationEvent>(
  { expose: true, path: "/location/live" },
  async (stream) => {
    clients.add(stream as unknown as StreamOut<BusLocationEvent>);
    try {
      // Keep the connection open until client disconnects
      await new Promise<void>(() => {});
    } finally {
      clients.delete(stream as unknown as StreamOut<BusLocationEvent>);
    }
  },
);

// Subscriber: forward pub/sub events to all connected streams
const _forwarder = new Subscription(busLocationUpdates, "broadcast-live-bus-locations", {
  handler: async (evt) => {
    for (const c of clients) {
      try {
        await c.send(evt);
      } catch {
        clients.delete(c);
      }
    }
  },
});