import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";

interface MarkReadParams {
  id: number;
}

// Marks a notification as read.
export const markRead = api<MarkReadParams, void>(
  { auth: true, expose: true, method: "PUT", path: "/notifications/:id/read" },
  withTiming(async (req) => {
    const auth = getAuthData()!;
    
    try {
      await prisma.notification.update({
        where: {
          id: req.id,
          userId: auth.userID,
        },
        data: {
          read: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw APIError.notFound("Notification not found");
      }
      throw error;
    }
  }, "mark_notification_read")
);

// Marks all notifications as read.
export const markAllRead = api<void, void>(
  { auth: true, expose: true, method: "PUT", path: "/notifications/mark-all-read" },
  withTiming(async () => {
    const auth = getAuthData()!;
    
    await prisma.notification.updateMany({
      where: {
        userId: auth.userID,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }, "mark_all_notifications_read")
);
