import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { reflectionsDB } from "./db";
import { CreateReflectionRequest, Reflection } from "./types";

// Creates or updates a reflection for a specific date.
export const create = api<CreateReflectionRequest, Reflection>(
  { auth: true, expose: true, method: "POST", path: "/reflections" },
  async (req) => {
    const auth = getAuthData()!;
    
    const row = await reflectionsDB.queryRow<{
      id: number;
      date: Date;
      study_time_by_subject: Record<string, number>;
      mood: number | null;
      notes: string | null;
      user_id: string;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO reflections (date, study_time_by_subject, mood, notes, user_id)
      VALUES (${req.date}, ${JSON.stringify(req.studyTimeBySubject || {})}, 
              ${req.mood || null}, ${req.notes || null}, ${auth.userID})
      ON CONFLICT (date, user_id) 
      DO UPDATE SET 
        study_time_by_subject = EXCLUDED.study_time_by_subject,
        mood = EXCLUDED.mood,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING *
    `;

    if (!row) {
      throw new Error("Failed to create reflection");
    }

    return {
      id: row.id,
      date: row.date,
      studyTimeBySubject: row.study_time_by_subject,
      mood: row.mood || undefined,
      notes: row.notes || undefined,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
