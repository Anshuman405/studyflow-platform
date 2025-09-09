import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { UpdateMaterialRequest, Material } from "./types";

interface UpdateMaterialParams {
  id: number;
}

// Updates an existing material.
export const update = api<UpdateMaterialParams & UpdateMaterialRequest, Material>(
  { auth: true, expose: true, method: "PUT", path: "/materials/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const { id, ...updateData } = req;

    if (Object.keys(updateData).length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    const fields = Object.keys(updateData).map((key, i) => {
      const typedKey = key as keyof UpdateMaterialRequest;
      const snakeKey = typedKey.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      let value = updateData[typedKey];
      if (typedKey === 'type' && typeof value === 'string') {
        value = value.toUpperCase();
      }
      return { col: snakeKey, val: value };
    });

    const setClause = fields.map((f, i) => `${f.col} = $${i + 1}`).join(', ');
    const queryParams = fields.map(f => f.val);

    const material = await db.rawQueryRow<Material>(`
      UPDATE materials
      SET ${setClause}
      WHERE id = $${queryParams.length + 1} AND user_id = $${queryParams.length + 2}
      RETURNING *
    `, ...queryParams, id, auth.userID);

    if (!material) {
      throw APIError.notFound("Material not found or permission denied");
    }

    return {
      ...material,
      type: material.type.toLowerCase() as any,
    };
  }
);
