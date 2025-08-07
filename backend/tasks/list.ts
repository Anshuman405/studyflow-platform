import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";
import { ListTasksResponse, Task } from "./types";

interface ListTasksParams {
  page?: Query<number>;
  limit?: Query<number>;
  status?: Query<string>;
  priority?: Query<string>;
  subject?: Query<string>;
}

// Retrieves all tasks for the current user with optimized query and pagination.
export const list = api<ListTasksParams, ListTasksResponse>(
  { auth: true, expose: true, method: "GET", path: "/tasks" },
  withTiming(async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100); // Cap at 100
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: auth.userID,
    };

    if (params.status && params.status !== 'all') {
      where.status = params.status.toUpperCase();
    }

    if (params.priority && params.priority !== 'all') {
      where.priority = params.priority.toUpperCase();
    }

    if (params.subject) {
      where.subject = {
        contains: params.subject,
        mode: 'insensitive',
      };
    }

    // Execute optimized query with pagination
    const [tasks, totalCount] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit,
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
      }),
      prisma.task.count({ where })
    ]);

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

    return { 
      tasks: formattedTasks,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    };
  }, "list_tasks")
);
