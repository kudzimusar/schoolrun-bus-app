import { SQLDatabase } from "encore.dev/storage/sqldb";

export const locationDB = new SQLDatabase("location", {
  migrations: "./migrations",
});
