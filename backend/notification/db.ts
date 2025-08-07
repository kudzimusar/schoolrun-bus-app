import { SQLDatabase } from "encore.dev/storage/sqldb";

export const notificationDB = new SQLDatabase("notification", {
  migrations: "./migrations",
});
