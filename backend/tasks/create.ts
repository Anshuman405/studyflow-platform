import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { CreateTaskRequest, Task } from "./types";

// Creates a new task.
export const create = api<CreateTaskRequest, Task>(
  { auth: true, expose: true, method: "POST", path: "/tasks" },
  async (req) => {
    const auth = getAuthData()!;
    
    const task = await prisma.task.create({
      data: {
        title: req.title,
        description: req.description,
        subject: req.subject,
        startDate: req.startDate,
        dueDate: req.dueDate,
        priority: req.priority.toUpperCase() as any,
        userId: auth.userID,
      },
    });

    return {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      subject: task.subject || undefined,
      startDate: task.startDate || undefined,
      dueDate: task.dueDate || undefined,
      priority: task.priority.toLowerCase() as any,
      status: task.status.toLowerCase().replace('_', '_') as any,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
);
