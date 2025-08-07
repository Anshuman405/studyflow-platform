import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { prisma } from "../db/db";
import { SearchCollegesResponse, College } from "./types";

interface SearchCollegesParams {
  query?: Query<string>;
  limit?: Query<number>;
}

// Searches for colleges by name with optimized query.
export const search = api<SearchCollegesParams, SearchCollegesResponse>(
  { expose: true, method: "GET", path: "/colleges/search" },
  async (req) => {
    const query = req.query || "";
    const limit = req.limit || 20;
    
    const colleges = await prisma.college.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
      select: {
        id: true,
        name: true,
        location: true,
        acceptanceRate: true,
        avgGpa: true,
        avgSat: true,
        avgAct: true,
        details: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const formattedColleges: College[] = colleges.map(college => ({
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
    }));

    return { colleges: formattedColleges };
  }
);
