import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { CreateCollegeRequest, College } from "./types";

// Creates a new college entry.
export const create = api<CreateCollegeRequest, College>(
  { auth: true, expose: true, method: "POST", path: "/colleges" },
  async (req) => {
    const auth = getAuthData()!;
    
    const college = await db.queryRow<College>`
      INSERT INTO colleges (name, location, acceptance_rate, avg_gpa, avg_sat, avg_act, details, created_by)
      VALUES (${req.name}, ${req.location}, ${req.acceptanceRate}, ${req.avgGpa}, ${req.avgSat}, ${req.avgAct}, ${JSON.stringify(req.details || {})}, ${auth.userID})
      RETURNING *
    `;

    if (!college) {
      throw APIError.internal("Failed to create college");
    }

    return college;
  }
);
