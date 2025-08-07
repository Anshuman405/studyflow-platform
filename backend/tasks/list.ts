import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { tasksDB } from "./db";
import { ListTasksResponse, Task } from "./types";

// Retrieves all tasks for the current user.
export const list = api<void, ListTasksResponse>(
  { auth: true, expose: true, method: "GET", path: "/tasks" },
  async () => {
    const auth = getAuthData()!;
    
    const rows = await tasksDB.queryAll<{
      id: number;
      title: string;
      description: string | null;
      subject: string | null;
      start_date: Date | null;
      due_date: Date | null;
      priority: string;
      status: string;
      user_id: string;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM tasks 
      WHERE user_id = ${auth.userID}
      ORDER BY created_at DESC
    `;

    const tasks: Task[] = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      subject: row.subject || undefined,
      startDate: row.start_date || undefined,
      dueDate: row.due_date || undefined,
      priority: row.priority as any,
      status: row.status as any,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { tasks };
  }
);
