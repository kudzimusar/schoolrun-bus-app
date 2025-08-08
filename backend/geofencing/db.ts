import { SQLDatabase } from "encore.dev/storage/sqldb";

export const geofencingDB = new SQLDatabase("geofencing", {
  migrations: "./migrations",
});
