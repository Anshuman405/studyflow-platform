import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { notesDB } from "./db";
import { UpdateNoteRequest, Note } from "./types";

interface UpdateNoteParams {
  id: number;
}

// Updates an existing note.
export const update = api<UpdateNoteParams & UpdateNoteRequest, Note>(
  { auth: true, expose: true, method: "PUT", path: "/notes/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(req.title);
    }
    if (req.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(req.content);
    }
    if (req.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(req.tags);
    }
    if (req.color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      values.push(req.color);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.id, auth.userID);

    const query = `
      UPDATE notes 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;

    const row = await notesDB.rawQueryRow<{
      id: number;
      title: string;
      content: string;
      tags: string[];
      color: string;
      user_id: string;
      created_at: Date;
      updated_at: Date;
    }>(query, ...values);

    if (!row) {
      throw APIError.notFound("Note not found");
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
