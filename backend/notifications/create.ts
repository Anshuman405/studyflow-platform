import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";

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
  withTiming(async (req) => {
    const auth = getAuthData()!;
    
    const notification = await prisma.notification.create({
      data: {
        title: req.title,
        message: req.message,
        type: req.type.toUpperCase() as any,
        taskId: req.taskId,
        eventId: req.eventId,
        userId: auth.userID,
      },
    });

    return {
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
    };
  }, "create_notification")
);
