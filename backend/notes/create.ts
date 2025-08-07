import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { notesDB } from "./db";
import { CreateNoteRequest, Note } from "./types";

// Creates a new note.
export const create = api<CreateNoteRequest, Note>(
  { auth: true, expose: true, method: "POST", path: "/notes" },
  async (req) => {
    const auth = getAuthData()!;
    
    const row = await notesDB.queryRow<{
      id: number;
      title: string;
      content: string;
      tags: string[];
      color: string;
      user_id: string;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO notes (title, content, tags, color, user_id)
      VALUES (${req.title}, ${req.content}, ${req.tags || []}, 
              ${req.color || '#ffffff'}, ${auth.userID})
      RETURNING *
    `;

    if (!row) {
      throw new Error("Failed to create note");
    }

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      tags: row.tags,
      color: row.color,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
