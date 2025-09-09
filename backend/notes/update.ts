import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { UpdateNoteRequest, Note } from "./types";

interface UpdateNoteParams {
  id: number;
}

// Updates an existing note.
export const update = api<UpdateNoteParams & UpdateNoteRequest, Note>(
  { auth: true, expose: true, method: "PUT", path: "/notes/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const { id, ...updateData } = req;

    if (Object.keys(updateData).length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    const fields = Object.keys(updateData).map((key, i) => {
      const typedKey = key as keyof UpdateNoteRequest;
      const snakeKey = typedKey.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      return { col: snakeKey, val: updateData[typedKey] };
    });

    const setClause = fields.map((f, i) => `${f.col} = $${i + 1}`).join(', ');
    const queryParams = fields.map(f => f.val);

    const note = await db.rawQueryRow<Note>(`
      UPDATE notes
      SET ${setClause}
      WHERE id = $${queryParams.length + 1} AND user_id = $${queryParams.length + 2}
      RETURNING *
    `, ...queryParams, id, auth.userID);

    if (!note) {
      throw APIError.notFound("Note not found or permission denied");
    }

    return note;
  }
);
