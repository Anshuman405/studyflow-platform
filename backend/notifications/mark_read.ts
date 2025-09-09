import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";

interface MarkReadParams {
  id: number;
}

// Marks a notification as read.
export const markRead = api<MarkReadParams, void>(
  { auth: true, expose: true, method: "PUT", path: "/notifications/:id/read" },
  async (req) => {
    const auth = getAuthData()!;
    
    const res = await db.exec`
      UPDATE notifications
      SET read = true
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    if (res.rowsAffected === 0) {
      throw APIError.notFound("Notification not found or permission denied");
    }
  }
);

// Marks all notifications as read.
export const markAllRead = api<void, void>(
  { auth: true, expose: true, method: "PUT", path: "/notifications/mark-all-read" },
  async () => {
    const auth = getAuthData()!;
    
    await db.exec`
      UPDATE notifications
      SET read = true
      WHERE user_id = ${auth.userID} AND read = false
    `;
  }
);
