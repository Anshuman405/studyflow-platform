import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";
import { ListEventsResponse, Event } from "./types";

interface ListEventsParams {
  page?: Query<number>;
  limit?: Query<number>;
  category?: Query<string>;
  startDate?: Query<string>;
  endDate?: Query<string>;
}

// Retrieves all events for the current user with optimized query and pagination.
export const list = api<ListEventsParams, ListEventsResponse>(
  { auth: true, expose: true, method: "GET", path: "/events" },
  withTiming(async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: auth.userID,
    };

    if (params.category && params.category !== 'all') {
      where.category = params.category.toUpperCase();
    }

    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) {
        where.date.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.date.lte = new Date(params.endDate);
      }
    }

    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: {
          date: 'asc',
        },
        skip: offset,
        take: limit,
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
      }),
      prisma.event.count({ where })
    ]);

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

    return { 
      events: formattedEvents,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    };
  }, "list_events")
);
