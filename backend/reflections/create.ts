import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { CreateReflectionRequest, Reflection } from "./types";

// Creates or updates a reflection for a specific date.
export const create = api<CreateReflectionRequest, Reflection>(
  { auth: true, expose: true, method: "POST", path: "/reflections" },
  async (req) => {
    const auth = getAuthData()!;
    
    const reflection = await prisma.reflection.upsert({
      where: {
        date_userId: {
          date: req.date,
          userId: auth.userID,
        },
      },
      update: {
        studyTimeBySubject: req.studyTimeBySubject || {},
        mood: req.mood,
        notes: req.notes,
      },
      create: {
        date: req.date,
        studyTimeBySubject: req.studyTimeBySubject || {},
        mood: req.mood,
        notes: req.notes,
        userId: auth.userID,
      },
    });

    return {
      id: reflection.id,
      date: reflection.date,
      studyTimeBySubject: reflection.studyTimeBySubject as Record<string, number>,
      mood: reflection.mood || undefined,
      notes: reflection.notes || undefined,
      userId: reflection.userId,
      createdAt: reflection.createdAt,
      updatedAt: reflection.updatedAt,
    };
  }
);
