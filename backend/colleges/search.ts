import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { prisma, withTiming } from "../db/db";
import { SearchCollegesResponse, College } from "./types";

interface SearchCollegesParams {
  query?: Query<string>;
  limit?: Query<number>;
  page?: Query<number>;
}

// Searches for colleges by name with optimized query and caching.
export const search = api<SearchCollegesParams, SearchCollegesResponse>(
  { expose: true, method: "GET", path: "/colleges/search" },
  withTiming(async (req) => {
    const query = req.query || "";
    const limit = Math.min(req.limit || 20, 50);
    const page = req.page || 1;
    const offset = (page - 1) * limit;
    
    // Use optimized search with indexes
    const where = query ? {
      name: {
        contains: query,
        mode: 'insensitive' as const,
      },
    } : {};

    const [colleges, totalCount] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy: [
          { name: 'asc' },
        ],
        skip: offset,
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
      }),
      prisma.college.count({ where })
    ]);

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

    return { 
      colleges: formattedColleges,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    };
  }, "search_colleges")
);
