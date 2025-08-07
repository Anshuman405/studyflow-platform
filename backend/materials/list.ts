import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { materialsDB } from "./db";
import { ListMaterialsResponse, Material } from "./types";

// Retrieves all study materials for the current user.
export const list = api<void, ListMaterialsResponse>(
  { auth: true, expose: true, method: "GET", path: "/materials" },
  async () => {
    const auth = getAuthData()!;
    
    const rows = await materialsDB.queryAll<{
      id: number;
      title: string;
      type: string;
      file_url: string | null;
      subject: string | null;
      user_id: string;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM materials 
      WHERE user_id = ${auth.userID}
      ORDER BY created_at DESC
    `;

    const materials: Material[] = rows.map(row => ({
      id: row.id,
      title: row.title,
      type: row.type as any,
      fileUrl: row.file_url || undefined,
      subject: row.subject || undefined,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { materials };
  }
);
