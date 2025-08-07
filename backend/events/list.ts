import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { ListEventsResponse, Event } from "./types";

// Retrieves all events for the current user with optimized query.
export const list = api<void, ListEventsResponse>(
  { auth: true, expose: true, method: "GET", path: "/events" },
  async () => {
    const auth = getAuthData()!;
    
    const events = await prisma.event.findMany({
      where: {
        userId: auth.userID,
      },
      orderBy: {
        date: 'asc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        category: true,
        location: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const formattedEvents: Event[] = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description || undefined,
      date: event.date,
      category: event.category.toLowerCase().replace('_', '_') as any,
      location: event.location || undefined,
      userId: event.userId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return { events: formattedEvents };
  }
);
