import { SQLDatabase } from "encore.dev/storage/sqldb";

export const reflectionsDB = new SQLDatabase("reflections", {
  migrations: "./migrations",
});
