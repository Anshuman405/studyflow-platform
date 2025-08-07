import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { materialsDB } from "./db";
import { CreateMaterialRequest, Material } from "./types";

// Creates a new study material.
export const create = api<CreateMaterialRequest, Material>(
  { auth: true, expose: true, method: "POST", path: "/materials" },
  async (req) => {
    const auth = getAuthData()!;
    
    const row = await materialsDB.queryRow<{
      id: number;
      title: string;
      type: string;
      file_url: string | null;
      subject: string | null;
      user_id: string;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO materials (title, type, file_url, subject, user_id)
      VALUES (${req.title}, ${req.type}, ${req.fileUrl || null}, 
              ${req.subject || null}, ${auth.userID})
      RETURNING *
    `;

    if (!row) {
      throw new Error("Failed to create material");
    }

    return {
      id: row.id,
      title: row.title,
      type: row.type as any,
      fileUrl: row.file_url || undefined,
      subject: row.subject || undefined,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
