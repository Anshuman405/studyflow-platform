import { SQLDatabase } from "encore.dev/storage/sqldb";

export const collegesDB = new SQLDatabase("colleges", {
  migrations: "./migrations",
});
