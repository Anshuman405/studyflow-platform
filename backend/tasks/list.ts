import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
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
  async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100); // Cap at 100
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM tasks WHERE user_id = '${auth.userID}'`;
    let countQuery = `SELECT count(*) FROM tasks WHERE user_id = '${auth.userID}'`;
    const queryParams: any[] = [];

    if (params.status && params.status !== 'all') {
      query += ` AND status = $${queryParams.length + 1}`;
      countQuery += ` AND status = $${queryParams.length + 1}`;
      queryParams.push(params.status.toUpperCase());
    }

    if (params.priority && params.priority !== 'all') {
      query += ` AND priority = $${queryParams.length + 1}`;
      countQuery += ` AND priority = $${queryParams.length + 1}`;
      queryParams.push(params.priority.toUpperCase());
    }

    if (params.subject) {
      query += ` AND subject ILIKE $${queryParams.length + 1}`;
      countQuery += ` AND subject ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${params.subject}%`);
    }

    query += ` ORDER BY status ASC, priority DESC, due_date ASC, created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [tasks, totalResult] = await Promise.all([
      db.rawQueryAll<Task>(query, ...queryParams),
      db.rawQueryRow<{ count: string }>(countQuery, ...queryParams)
    ]);

    const totalCount = parseInt(totalResult?.count || "0", 10);

    const formattedTasks: Task[] = tasks.map(task => ({
      ...task,
      priority: task.priority.toLowerCase() as any,
      status: task.status.toLowerCase().replace('_', '_') as any,
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
  }
);
