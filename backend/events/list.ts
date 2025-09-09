import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
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
  async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM events WHERE user_id = ${auth.userID}`;
    let countQuery = `SELECT count(*) FROM events WHERE user_id = ${auth.userID}`;
    const queryParams: any[] = [];

    if (params.category && params.category !== 'all') {
      query += ` AND category = $${queryParams.length + 1}`;
      countQuery += ` AND category = $${queryParams.length + 1}`;
      queryParams.push(params.category.toUpperCase());
    }

    if (params.startDate) {
      query += ` AND date >= $${queryParams.length + 1}`;
      countQuery += ` AND date >= $${queryParams.length + 1}`;
      queryParams.push(new Date(params.startDate));
    }
    if (params.endDate) {
      query += ` AND date <= $${queryParams.length + 1}`;
      countQuery += ` AND date <= $${queryParams.length + 1}`;
      queryParams.push(new Date(params.endDate));
    }

    query += ` ORDER BY date ASC LIMIT ${limit} OFFSET ${offset}`;

    const [events, totalResult] = await Promise.all([
      db.rawQueryAll<Event>(query, ...queryParams),
      db.rawQueryRow<{ count: string }>(countQuery, ...queryParams)
    ]);

    const totalCount = parseInt(totalResult?.count || "0", 10);

    const formattedEvents: Event[] = events.map(event => ({
      ...event,
      category: event.category.toLowerCase() as any,
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
  }
);
