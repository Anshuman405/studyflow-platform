import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { collegesDB } from "./db";
import { SearchCollegesResponse, College } from "./types";

interface SearchCollegesParams {
  query?: Query<string>;
  limit?: Query<number>;
}

// Searches for colleges by name.
export const search = api<SearchCollegesParams, SearchCollegesResponse>(
  { expose: true, method: "GET", path: "/colleges/search" },
  async (req) => {
    const query = req.query || "";
    const limit = req.limit || 20;
    
    const rows = await collegesDB.queryAll<{
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
      SELECT * FROM colleges 
      WHERE name ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${limit}
    `;

    const colleges: College[] = rows.map(row => ({
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
    }));

    return { colleges };
  }
);
