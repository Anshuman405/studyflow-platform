import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { CreateMaterialRequest, Material } from "./types";

// Creates a new study material.
export const create = api<CreateMaterialRequest, Material>(
  { auth: true, expose: true, method: "POST", path: "/materials" },
  async (req) => {
    const auth = getAuthData()!;
    
    const material = await db.queryRow<Material>`
      INSERT INTO materials (title, type, file_url, subject, user_id)
      VALUES (${req.title}, ${req.type.toUpperCase()}, ${req.fileUrl}, ${req.subject}, ${auth.userID})
      RETURNING *
    `;

    if (!material) {
      throw APIError.internal("Failed to create material");
    }

    return {
      ...material,
      type: material.type.toLowerCase() as any,
    };
  }
);
