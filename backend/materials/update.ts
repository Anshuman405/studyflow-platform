import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { UpdateMaterialRequest, Material } from "./types";

interface UpdateMaterialParams {
  id: number;
}

// Updates an existing material.
export const update = api<UpdateMaterialParams & UpdateMaterialRequest, Material>(
  { auth: true, expose: true, method: "PUT", path: "/materials/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const updateData: any = {};
    
    if (req.title !== undefined) updateData.title = req.title;
    if (req.type !== undefined) updateData.type = req.type.toUpperCase();
    if (req.fileUrl !== undefined) updateData.fileUrl = req.fileUrl;
    if (req.fileName !== undefined) updateData.fileName = req.fileName;
    if (req.fileSize !== undefined) updateData.fileSize = req.fileSize;
    if (req.mimeType !== undefined) updateData.mimeType = req.mimeType;
    if (req.subject !== undefined) updateData.subject = req.subject;

    if (Object.keys(updateData).length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    try {
      const material = await prisma.material.update({
        where: {
          id: req.id,
          userId: auth.userID,
        },
        data: updateData,
      });

      return {
        id: material.id,
        title: material.title,
        type: material.type.toLowerCase() as any,
        fileUrl: material.fileUrl || undefined,
        fileName: material.fileName || undefined,
        fileSize: material.fileSize || undefined,
        mimeType: material.mimeType || undefined,
        subject: material.subject || undefined,
        userId: material.userId,
        createdAt: material.createdAt,
        updatedAt: material.updatedAt,
      };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw APIError.notFound("Material not found");
      }
      throw error;
    }
  }
);
