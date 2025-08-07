import { SQLDatabase } from "encore.dev/storage/sqldb";

export const materialsDB = new SQLDatabase("materials", {
  migrations: "./migrations",
});
