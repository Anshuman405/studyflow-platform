import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { ListTasksResponse, Task } from "./types";

// Retrieves all tasks for the current user with optimized query.
export const list = api<void, ListTasksResponse>(
  { auth: true, expose: true, method: "GET", path: "/tasks" },
  async () => {
    const auth = getAuthData()!;
    
    const tasks = await prisma.task.findMany({
      where: {
        userId: auth.userID,
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        startDate: true,
        dueDate: true,
        priority: true,
        status: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const formattedTasks: Task[] = tasks.map(task => ({
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
    }));

    return { tasks: formattedTasks };
  }
);
