import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";

interface DeleteNoteParams {
  id: number;
}

// Deletes a note.
export const deleteNote = api<DeleteNoteParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/notes/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    try {
      await prisma.note.delete({
        where: {
          id: req.id,
          userId: auth.userID,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw APIError.notFound("Note not found");
      }
      throw error;
    }
  }
);
