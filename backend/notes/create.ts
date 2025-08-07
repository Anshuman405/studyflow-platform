import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { CreateNoteRequest, Note } from "./types";

// Creates a new note.
export const create = api<CreateNoteRequest, Note>(
  { auth: true, expose: true, method: "POST", path: "/notes" },
  async (req) => {
    const auth = getAuthData()!;
    
    const note = await prisma.note.create({
      data: {
        title: req.title,
        content: req.content,
        tags: req.tags || [],
        color: req.color || '#ffffff',
        userId: auth.userID,
      },
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
  }
);
