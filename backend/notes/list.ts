import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";
import { ListNotesResponse, Note } from "./types";

interface ListNotesParams {
  page?: Query<number>;
  limit?: Query<number>;
  search?: Query<string>;
  tags?: Query<string>;
}

// Retrieves all notes for the current user with optimized query and search.
export const list = api<ListNotesParams, ListNotesResponse>(
  { auth: true, expose: true, method: "GET", path: "/notes" },
  withTiming(async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: auth.userID,
    };

    if (params.search) {
      where.OR = [
        {
          title: {
            contains: params.search,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: params.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (params.tags) {
      where.tags = {
        has: params.tags,
      };
    }

    const [notes, totalCount] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy: {
          updatedAt: 'desc',
        },
        skip: offset,
        take: limit,
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
      }),
      prisma.note.count({ where })
    ]);

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

    return { 
      notes: formattedNotes,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    };
  }, "list_notes")
);
