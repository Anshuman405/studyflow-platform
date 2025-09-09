import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";

export type NotificationType = "reminder" | "deadline" | "group_invite" | "system";

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  taskId?: number;
  eventId?: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  taskId?: number;
  eventId?: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new notification.
export const create = api<CreateNotificationRequest, Notification>(
  { auth: true, expose: true, method: "POST", path: "/notifications" },
  async (req) => {
    const auth = getAuthData()!;
    
    const notification = await db.queryRow<Notification>`
      INSERT INTO notifications (title, message, type, task_id, event_id, user_id)
      VALUES (${req.title}, ${req.message}, ${req.type.toUpperCase()}, ${req.taskId}, ${req.eventId}, ${auth.userID})
      RETURNING *
    `;

    if (!notification) {
      throw APIError.internal("Failed to create notification");
    }

    return {
      ...notification,
      type: notification.type.toLowerCase() as any,
    };
  }
);
