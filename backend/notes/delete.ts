import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { notesDB } from "./db";

interface DeleteNoteParams {
  id: number;
}

// Deletes a note.
export const deleteNote = api<DeleteNoteParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/notes/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const result = await notesDB.exec`
      DELETE FROM notes 
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;
  }
);
