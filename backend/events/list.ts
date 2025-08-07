import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { eventsDB } from "./db";
import { ListEventsResponse, Event } from "./types";

// Retrieves all events for the current user.
export const list = api<void, ListEventsResponse>(
  { auth: true, expose: true, method: "GET", path: "/events" },
  async () => {
    const auth = getAuthData()!;
    
    const rows = await eventsDB.queryAll<{
      id: number;
      title: string;
      description: string | null;
      date: Date;
      category: string;
      location: string | null;
      user_id: string;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM events 
      WHERE user_id = ${auth.userID}
      ORDER BY date ASC
    `;

    const events: Event[] = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      date: row.date,
      category: row.category as any,
      location: row.location || undefined,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { events };
  }
);
