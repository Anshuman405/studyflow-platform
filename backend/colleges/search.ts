import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { db } from "../db/db";
import { SearchCollegesResponse, College } from "./types";

interface SearchCollegesParams {
  query?: Query<string>;
  limit?: Query<number>;
  page?: Query<number>;
}

// Searches for colleges by name with optimized query and caching.
export const search = api<SearchCollegesParams, SearchCollegesResponse>(
  { expose: true, method: "GET", path: "/colleges/search" },
  async (req) => {
    const query = req.query || "";
    const limit = Math.min(req.limit || 20, 50);
    const page = req.page || 1;
    const offset = (page - 1) * limit;
    
    const whereClause = query ? `WHERE name ILIKE ${'%' + query + '%'}` : "";

    const colleges = await db.queryAll<College>`
      SELECT * FROM colleges
      ${whereClause}
      ORDER BY name ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const totalResult = await db.queryRow<{ count: string }>`
      SELECT count(*) FROM colleges
      ${whereClause}
    `;
    const totalCount = parseInt(totalResult?.count || "0", 10);

    return { 
      colleges: colleges,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    };
  }
);
