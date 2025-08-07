import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";
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
  withTiming(async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: auth.userID,
    };

    if (params.type && params.type !== 'all') {
      where.type = params.type.toUpperCase();
    }

    if (params.subject) {
      where.subject = {
        contains: params.subject,
        mode: 'insensitive',
      };
    }

    const [materials, totalCount] = await Promise.all([
      prisma.material.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
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
      }),
      prisma.material.count({ where })
    ]);

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
  }, "list_materials")
);
