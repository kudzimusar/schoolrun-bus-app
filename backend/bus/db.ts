import { SQLDatabase } from "encore.dev/storage/sqldb";

export const busDB = new SQLDatabase("bus", {
  migrations: "./migrations",
});
