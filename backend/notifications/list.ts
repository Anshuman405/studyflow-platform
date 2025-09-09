import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { Notification } from "./create";

interface ListNotificationsParams {
  page?: Query<number>;
  limit?: Query<number>;
  unreadOnly?: Query<boolean>;
}

interface ListNotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Retrieves all notifications for the current user.
export const list = api<ListNotificationsParams, ListNotificationsResponse>(
  { auth: true, expose: true, method: "GET", path: "/notifications" },
  async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    let whereClause = `WHERE user_id = '${auth.userID}'`;
    if (params.unreadOnly) {
      whereClause += ` AND read = false`;
    }

    const notifications = await db.queryAll<Notification>`
      SELECT * FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await db.queryRow<{ count: string }>`
      SELECT count(*) FROM notifications ${whereClause}
    `;
    const totalCount = parseInt(totalResult?.count || "0", 10);

    const formattedNotifications: Notification[] = notifications.map(notification => ({
      ...notification,
      type: notification.type.toLowerCase() as any,
    }));

    return { 
      notifications: formattedNotifications,
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
