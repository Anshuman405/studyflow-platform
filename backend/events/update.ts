import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { eventsDB } from "./db";
import { UpdateEventRequest, Event } from "./types";

interface UpdateEventParams {
  id: number;
}

// Updates an existing event.
export const update = api<UpdateEventParams & UpdateEventRequest, Event>(
  { auth: true, expose: true, method: "PUT", path: "/events/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(req.title);
    }
    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(req.description || null);
    }
    if (req.date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      values.push(req.date);
    }
    if (req.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(req.category);
    }
    if (req.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(req.location || null);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.id, auth.userID);

    const query = `
      UPDATE events 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;

    const row = await eventsDB.rawQueryRow<{
      id: number;
      title: string;
      description: string | null;
      date: Date;
      category: string;
      location: string | null;
      user_id: string;
      created_at: Date;
      updated_at: Date;
    }>(query, ...values);

    if (!row) {
      throw APIError.notFound("Event not found");
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
