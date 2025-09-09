import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { ListReflectionsResponse, Reflection } from "./types";

interface ListReflectionsParams {
  page?: Query<number>;
  limit?: Query<number>;
  startDate?: Query<string>;
  endDate?: Query<string>;
}

// Retrieves all reflections for the current user with optimized query.
export const list = api<ListReflectionsParams, ListReflectionsResponse>(
  { auth: true, expose: true, method: "GET", path: "/reflections" },
  async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM reflections WHERE user_id = ${auth.userID}`;
    let countQuery = `SELECT count(*) FROM reflections WHERE user_id = ${auth.userID}`;
    const queryParams: any[] = [];

    if (params.startDate) {
      query += ` AND date >= $${queryParams.length + 1}`;
      countQuery += ` AND date >= $${queryParams.length + 1}`;
      queryParams.push(new Date(params.startDate));
    }
    if (params.endDate) {
      query += ` AND date <= $${queryParams.length + 1}`;
      countQuery += ` AND date <= $${queryParams.length + 1}`;
      queryParams.push(new Date(params.endDate));
    }

    query += ` ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}`;

    const [reflections, totalResult] = await Promise.all([
      db.rawQueryAll<Reflection>(query, ...queryParams),
      db.rawQueryRow<{ count: string }>(countQuery, ...queryParams)
    ]);

    const totalCount = parseInt(totalResult?.count || "0", 10);

    return { 
      reflections: reflections,
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
