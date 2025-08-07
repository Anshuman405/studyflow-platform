import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { ListMaterialsResponse, Material } from "./types";

// Retrieves all study materials for the current user with optimized query.
export const list = api<void, ListMaterialsResponse>(
  { auth: true, expose: true, method: "GET", path: "/materials" },
  async () => {
    const auth = getAuthData()!;
    
    const materials = await prisma.material.findMany({
      where: {
        userId: auth.userID,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        type: true,
        fileUrl: true,
        subject: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const formattedMaterials: Material[] = materials.map(material => ({
      id: material.id,
      title: material.title,
      type: material.type.toLowerCase() as any,
      fileUrl: material.fileUrl || undefined,
      subject: material.subject || undefined,
      userId: material.userId,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    }));

    return { materials: formattedMaterials };
  }
);
