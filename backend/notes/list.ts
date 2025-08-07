import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { notesDB } from "./db";
import { ListNotesResponse, Note } from "./types";

// Retrieves all notes for the current user.
export const list = api<void, ListNotesResponse>(
  { auth: true, expose: true, method: "GET", path: "/notes" },
  async () => {
    const auth = getAuthData()!;
    
    const rows = await notesDB.queryAll<{
      id: number;
      title: string;
      content: string;
      tags: string[];
      color: string;
      user_id: string;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM notes 
      WHERE user_id = ${auth.userID}
      ORDER BY updated_at DESC
    `;

    const notes: Note[] = rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      tags: row.tags,
      color: row.color,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { notes };
  }
);
