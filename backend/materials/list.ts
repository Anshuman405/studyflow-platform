import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { ListMaterialsResponse, Material } from "./types";

interface ListMaterialsParams {
  page?: Query<number>;
  limit?: Query<number>;
  type?: Query<string>;
  subject?: Query<string>;
}

// Retrieves all study materials for the current user with optimized query.
export const list = api<ListMaterialsParams, ListMaterialsResponse>(
  { auth: true, expose: true, method: "GET", path: "/materials" },
  async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM materials WHERE user_id = ${auth.userID}`;
    let countQuery = `SELECT count(*) FROM materials WHERE user_id = ${auth.userID}`;
    const queryParams: any[] = [];

    if (params.type && params.type !== 'all') {
      query += ` AND type = $${queryParams.length + 1}`;
      countQuery += ` AND type = $${queryParams.length + 1}`;
      queryParams.push(params.type.toUpperCase());
    }

    if (params.subject) {
      query += ` AND subject ILIKE $${queryParams.length + 1}`;
      countQuery += ` AND subject ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${params.subject}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [materials, totalResult] = await Promise.all([
      db.rawQueryAll<Material>(query, ...queryParams),
      db.rawQueryRow<{ count: string }>(countQuery, ...queryParams)
    ]);

    const totalCount = parseInt(totalResult?.count || "0", 10);

    const formattedMaterials: Material[] = materials.map(material => ({
      ...material,
      type: material.type.toLowerCase() as any,
    }));

    return { 
      materials: formattedMaterials,
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
