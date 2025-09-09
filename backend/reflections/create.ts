import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { CreateReflectionRequest, Reflection } from "./types";

// Creates or updates a reflection for a specific date.
export const create = api<CreateReflectionRequest, Reflection>(
  { auth: true, expose: true, method: "POST", path: "/reflections" },
  async (req) => {
    const auth = getAuthData()!;
    
    const reflection = await db.queryRow<Reflection>`
      INSERT INTO reflections (date, study_time_by_subject, mood, notes, user_id)
      VALUES (${req.date}, ${JSON.stringify(req.studyTimeBySubject || {})}, ${req.mood}, ${req.notes}, ${auth.userID})
      ON CONFLICT (date, user_id) DO UPDATE SET
        study_time_by_subject = EXCLUDED.study_time_by_subject,
        mood = EXCLUDED.mood,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING *
    `;

    if (!reflection) {
      throw APIError.internal("Failed to create or update reflection");
    }

    return reflection;
  }
);
