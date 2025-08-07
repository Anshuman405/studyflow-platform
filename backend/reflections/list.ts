import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";
import { ListReflectionsResponse, Reflection } from "./types";

interface ListReflectionsParams {
  page?: Query<number>;
  limit?: Query<number>;
  startDate?: Query<string>;
  endDate?: Query<string>;
}

// Retrieves all reflections for the current user with optimized query.
export const list = api<ListReflectionsParams, ListReflectionsResponse>(
  { auth: true, expose: true, method: "GET", path: "/reflections" },
  withTiming(async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: auth.userID,
    };

    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) {
        where.date.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.date.lte = new Date(params.endDate);
      }
    }

    const [reflections, totalCount] = await Promise.all([
      prisma.reflection.findMany({
        where,
        orderBy: {
          date: 'desc',
        },
        skip: offset,
        take: limit,
        select: {
          id: true,
          date: true,
          studyTimeBySubject: true,
          mood: true,
          notes: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      prisma.reflection.count({ where })
    ]);

    const formattedReflections: Reflection[] = reflections.map(reflection => ({
      id: reflection.id,
      date: reflection.date,
      studyTimeBySubject: reflection.studyTimeBySubject as Record<string, number>,
      mood: reflection.mood || undefined,
      notes: reflection.notes || undefined,
      userId: reflection.userId,
      createdAt: reflection.createdAt,
      updatedAt: reflection.updatedAt,
    }));

    return { 
      reflections: formattedReflections,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    };
  }, "list_reflections")
);
