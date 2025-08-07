import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { CreateCollegeRequest, College } from "./types";

// Creates a new college entry.
export const create = api<CreateCollegeRequest, College>(
  { auth: true, expose: true, method: "POST", path: "/colleges" },
  async (req) => {
    const auth = getAuthData()!;
    
    const college = await prisma.college.create({
      data: {
        name: req.name,
        location: req.location,
        acceptanceRate: req.acceptanceRate,
        avgGpa: req.avgGpa,
        avgSat: req.avgSat,
        avgAct: req.avgAct,
        details: req.details || {},
        createdBy: auth.userID,
      },
    });

    return {
      id: college.id,
      name: college.name,
      location: college.location || undefined,
      acceptanceRate: college.acceptanceRate || undefined,
      avgGpa: college.avgGpa || undefined,
      avgSat: college.avgSat || undefined,
      avgAct: college.avgAct || undefined,
      details: college.details as Record<string, any>,
      createdBy: college.createdBy,
      createdAt: college.createdAt,
      updatedAt: college.updatedAt,
    };
  }
);
