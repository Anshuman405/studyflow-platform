import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { UpdateEventRequest, Event } from "./types";

interface UpdateEventParams {
  id: number;
}

// Updates an existing event.
export const update = api<UpdateEventParams & UpdateEventRequest, Event>(
  { auth: true, expose: true, method: "PUT", path: "/events/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const updateData: any = {};
    
    if (req.title !== undefined) updateData.title = req.title;
    if (req.description !== undefined) updateData.description = req.description;
    if (req.date !== undefined) updateData.date = req.date;
    if (req.category !== undefined) updateData.category = req.category.toUpperCase().replace('_', '_');
    if (req.location !== undefined) updateData.location = req.location;

    if (Object.keys(updateData).length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    try {
      const event = await prisma.event.update({
        where: {
          id: req.id,
          userId: auth.userID,
        },
        data: updateData,
      });

      return {
        id: event.id,
        title: event.title,
        description: event.description || undefined,
        date: event.date,
        category: event.category.toLowerCase().replace('_', '_') as any,
        location: event.location || undefined,
        userId: event.userId,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw APIError.notFound("Event not found");
      }
      throw error;
    }
  }
);
