import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { ListReflectionsResponse, Reflection } from "./types";

// Retrieves all reflections for the current user with optimized query.
export const list = api<void, ListReflectionsResponse>(
  { auth: true, expose: true, method: "GET", path: "/reflections" },
  async () => {
    const auth = getAuthData()!;
    
    const reflections = await prisma.reflection.findMany({
      where: {
        userId: auth.userID,
      },
      orderBy: {
        date: 'desc',
      },
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
    });

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

    return { reflections: formattedReflections };
  }
);
