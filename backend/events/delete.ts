import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";

interface DeleteEventParams {
  id: number;
}

// Deletes an event.
export const deleteEvent = api<DeleteEventParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/events/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const res = await db.exec`
      DELETE FROM events
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    if (res.rowsAffected === 0) {
      throw APIError.notFound("Event not found or permission denied");
    }
  }
);
