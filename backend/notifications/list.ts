import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";
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
  withTiming(async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    const where: any = {
      userId: auth.userID,
    };

    if (params.unreadOnly) {
      where.read = false;
    }

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          read: true,
          taskId: true,
          eventId: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      prisma.notification.count({ where })
    ]);

    const formattedNotifications: Notification[] = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type.toLowerCase() as any,
      read: notification.read,
      taskId: notification.taskId || undefined,
      eventId: notification.eventId || undefined,
      userId: notification.userId,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
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
  }, "list_notifications")
);
