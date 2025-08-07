import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { ListNotesResponse, Note } from "./types";

// Retrieves all notes for the current user with optimized query.
export const list = api<void, ListNotesResponse>(
  { auth: true, expose: true, method: "GET", path: "/notes" },
  async () => {
    const auth = getAuthData()!;
    
    const notes = await prisma.note.findMany({
      where: {
        userId: auth.userID,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        color: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const formattedNotes: Note[] = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags,
      color: note.color,
      userId: note.userId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

    return { notes: formattedNotes };
  }
);
