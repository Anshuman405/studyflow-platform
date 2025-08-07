import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { CreateMaterialRequest, Material } from "./types";

// Creates a new study material.
export const create = api<CreateMaterialRequest, Material>(
  { auth: true, expose: true, method: "POST", path: "/materials" },
  async (req) => {
    const auth = getAuthData()!;
    
    const material = await prisma.material.create({
      data: {
        title: req.title,
        type: req.type.toUpperCase() as any,
        fileUrl: req.fileUrl,
        subject: req.subject,
        userId: auth.userID,
      },
    });

    return {
      id: material.id,
      title: material.title,
      type: material.type.toLowerCase() as any,
      fileUrl: material.fileUrl || undefined,
      subject: material.subject || undefined,
      userId: material.userId,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    };
  }
);
