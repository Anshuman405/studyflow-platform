import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { CreateEventRequest, Event } from "./types";

// Creates a new event.
export const create = api<CreateEventRequest, Event>(
  { auth: true, expose: true, method: "POST", path: "/events" },
  async (req) => {
    const auth = getAuthData()!;
    
    const event = await prisma.event.create({
      data: {
        title: req.title,
        description: req.description,
        date: req.date,
        category: req.category.toUpperCase().replace('_', '_') as any,
        location: req.location,
        userId: auth.userID,
      },
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
  }
);
