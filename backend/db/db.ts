import { SQLDatabase } from "encore.dev/storage/sqldb";

// The main database for the application.
export const db = new SQLDatabase("studyflow", {
  migrations: "./migrations",
});
