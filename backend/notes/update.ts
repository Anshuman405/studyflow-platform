import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { UpdateNoteRequest, Note } from "./types";

interface UpdateNoteParams {
  id: number;
}

// Updates an existing note.
export const update = api<UpdateNoteParams & UpdateNoteRequest, Note>(
  { auth: true, expose: true, method: "PUT", path: "/notes/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const updateData: any = {};
    
    if (req.title !== undefined) updateData.title = req.title;
    if (req.content !== undefined) updateData.content = req.content;
    if (req.tags !== undefined) updateData.tags = req.tags;
    if (req.color !== undefined) updateData.color = req.color;

    if (Object.keys(updateData).length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    try {
      const note = await prisma.note.update({
        where: {
          id: req.id,
          userId: auth.userID,
        },
        data: updateData,
      });

      return {
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        color: note.color,
        userId: note.userId,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw APIError.notFound("Note not found");
      }
      throw error;
    }
  }
);
