import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { CreateEventRequest, Event } from "./types";

// Creates a new event.
export const create = api<CreateEventRequest, Event>(
  { auth: true, expose: true, method: "POST", path: "/events" },
  async (req) => {
    const auth = getAuthData()!;
    
    const event = await db.queryRow<Event>`
      INSERT INTO events (title, description, date, category, location, user_id)
      VALUES (${req.title}, ${req.description}, ${req.date}, ${req.category.toUpperCase()}, ${req.location}, ${auth.userID})
      RETURNING *
    `;

    if (!event) {
      throw APIError.internal("Failed to create event");
    }

    return {
      ...event,
      category: event.category.toLowerCase() as any,
    };
  }
);
