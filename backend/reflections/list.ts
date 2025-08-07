import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { reflectionsDB } from "./db";
import { ListReflectionsResponse, Reflection } from "./types";

// Retrieves all reflections for the current user.
export const list = api<void, ListReflectionsResponse>(
  { auth: true, expose: true, method: "GET", path: "/reflections" },
  async () => {
    const auth = getAuthData()!;
    
    const rows = await reflectionsDB.queryAll<{
      id: number;
      date: Date;
      study_time_by_subject: Record<string, number>;
      mood: number | null;
      notes: string | null;
      user_id: string;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM reflections 
      WHERE user_id = ${auth.userID}
      ORDER BY date DESC
    `;

    const reflections: Reflection[] = rows.map(row => ({
      id: row.id,
      date: row.date,
      studyTimeBySubject: row.study_time_by_subject,
      mood: row.mood || undefined,
      notes: row.notes || undefined,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { reflections };
  }
);
