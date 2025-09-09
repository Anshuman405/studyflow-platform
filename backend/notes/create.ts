import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { CreateNoteRequest, Note } from "./types";

// Creates a new note.
export const create = api<CreateNoteRequest, Note>(
  { auth: true, expose: true, method: "POST", path: "/notes" },
  async (req) => {
    const auth = getAuthData()!;
    
    const note = await db.queryRow<Note>`
      INSERT INTO notes (title, content, tags, color, user_id)
      VALUES (${req.title}, ${req.content}, ${req.tags || []}, ${req.color || '#ffffff'}, ${auth.userID})
      RETURNING *
    `;

    if (!note) {
      throw APIError.internal("Failed to create note");
    }

    return note;
  }
);
