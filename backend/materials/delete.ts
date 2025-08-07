import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";

interface DeleteMaterialParams {
  id: number;
}

// Deletes a study material.
export const deleteMaterial = api<DeleteMaterialParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/materials/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    try {
      await prisma.material.delete({
        where: {
          id: req.id,
          userId: auth.userID,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw APIError.notFound("Material not found");
      }
      throw error;
    }
  }
);
