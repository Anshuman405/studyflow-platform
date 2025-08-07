import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { eventsDB } from "./db";
import { CreateEventRequest, Event } from "./types";

// Creates a new event.
export const create = api<CreateEventRequest, Event>(
  { auth: true, expose: true, method: "POST", path: "/events" },
  async (req) => {
    const auth = getAuthData()!;
    
    const row = await eventsDB.queryRow<{
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
      INSERT INTO events (title, description, date, category, location, user_id)
      VALUES (${req.title}, ${req.description || null}, ${req.date}, 
              ${req.category}, ${req.location || null}, ${auth.userID})
      RETURNING *
    `;

    if (!row) {
      throw new Error("Failed to create event");
    }

    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      date: row.date,
      category: row.category as any,
      location: row.location || undefined,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
