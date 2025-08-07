import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { collegesDB } from "./db";
import { CreateCollegeRequest, College } from "./types";

// Creates a new college entry.
export const create = api<CreateCollegeRequest, College>(
  { auth: true, expose: true, method: "POST", path: "/colleges" },
  async (req) => {
    const auth = getAuthData()!;
    
    const row = await collegesDB.queryRow<{
      id: number;
      name: string;
      location: string | null;
      acceptance_rate: number | null;
      avg_gpa: number | null;
      avg_sat: number | null;
      avg_act: number | null;
      details: Record<string, any>;
      created_by: string;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO colleges (name, location, acceptance_rate, avg_gpa, avg_sat, avg_act, details, created_by)
      VALUES (${req.name}, ${req.location || null}, ${req.acceptanceRate || null}, 
              ${req.avgGpa || null}, ${req.avgSat || null}, ${req.avgAct || null},
              ${JSON.stringify(req.details || {})}, ${auth.userID})
      RETURNING *
    `;

    if (!row) {
      throw new Error("Failed to create college");
    }

    return {
      id: row.id,
      name: row.name,
      location: row.location || undefined,
      acceptanceRate: row.acceptance_rate || undefined,
      avgGpa: row.avg_gpa || undefined,
      avgSat: row.avg_sat || undefined,
      avgAct: row.avg_act || undefined,
      details: row.details,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
