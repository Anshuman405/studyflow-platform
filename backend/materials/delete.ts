import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { materialsDB } from "./db";

interface DeleteMaterialParams {
  id: number;
}

// Deletes a study material.
export const deleteMaterial = api<DeleteMaterialParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/materials/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const result = await materialsDB.exec`
      DELETE FROM materials 
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;
  }
);
