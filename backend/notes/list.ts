import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { ListNotesResponse, Note } from "./types";

interface ListNotesParams {
  page?: Query<number>;
  limit?: Query<number>;
  search?: Query<string>;
  tags?: Query<string>;
}

// Retrieves all notes for the current user with optimized query and search.
export const list = api<ListNotesParams, ListNotesResponse>(
  { auth: true, expose: true, method: "GET", path: "/notes" },
  async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM notes WHERE user_id = ${auth.userID}`;
    let countQuery = `SELECT count(*) FROM notes WHERE user_id = ${auth.userID}`;
    const queryParams: any[] = [];

    if (params.search) {
      const searchPattern = `%${params.search}%`;
      query += ` AND (title ILIKE $${queryParams.length + 1} OR content ILIKE $${queryParams.length + 1})`;
      countQuery += ` AND (title ILIKE $${queryParams.length + 1} OR content ILIKE $${queryParams.length + 1})`;
      queryParams.push(searchPattern);
    }

    if (params.tags) {
      query += ` AND tags @> $${queryParams.length + 1}`;
      countQuery += ` AND tags @> $${queryParams.length + 1}`;
      queryParams.push([params.tags]);
    }

    query += ` ORDER BY updated_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [notes, totalResult] = await Promise.all([
      db.rawQueryAll<Note>(query, ...queryParams),
      db.rawQueryRow<{ count: string }>(countQuery, ...queryParams)
    ]);

    const totalCount = parseInt(totalResult?.count || "0", 10);

    return { 
      notes: notes,
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
