import { SQLDatabase } from "encore.dev/storage/sqldb";

export const incidentDB = new SQLDatabase("incident", {
  migrations: "./migrations",
});
