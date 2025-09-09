import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { UpdateEventRequest, Event } from "./types";

interface UpdateEventParams {
  id: number;
}

// Updates an existing event.
export const update = api<UpdateEventParams & UpdateEventRequest, Event>(
  { auth: true, expose: true, method: "PUT", path: "/events/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const { id, ...updateData } = req;

    if (Object.keys(updateData).length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    const fields = Object.keys(updateData).map((key, i) => {
      const typedKey = key as keyof UpdateEventRequest;
      // Convert camelCase to snake_case for DB
      const snakeKey = typedKey.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      let value = updateData[typedKey];
      if (typedKey === 'category' && typeof value === 'string') {
        value = value.toUpperCase();
      }
      return { col: snakeKey, val: value };
    });

    const setClause = fields.map((f, i) => `${f.col} = $${i + 1}`).join(', ');
    const queryParams = fields.map(f => f.val);

    const event = await db.rawQueryRow<Event>(`
      UPDATE events
      SET ${setClause}
      WHERE id = $${queryParams.length + 1} AND user_id = $${queryParams.length + 2}
      RETURNING *
    `, ...queryParams, id, auth.userID);

    if (!event) {
      throw APIError.notFound("Event not found or permission denied");
    }

    return {
      ...event,
      category: event.category.toLowerCase() as any,
    };
  }
);
