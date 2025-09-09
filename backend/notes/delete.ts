import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";

interface DeleteNoteParams {
  id: number;
}

// Deletes a note.
export const deleteNote = api<DeleteNoteParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/notes/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const res = await db.exec`
      DELETE FROM notes
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    if (res.rowsAffected === 0) {
      throw APIError.notFound("Note not found or permission denied");
    }
  }
);
