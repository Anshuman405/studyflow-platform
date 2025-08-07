import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { tasksDB } from "./db";
import { CreateTaskRequest, Task } from "./types";

// Creates a new task.
export const create = api<CreateTaskRequest, Task>(
  { auth: true, expose: true, method: "POST", path: "/tasks" },
  async (req) => {
    const auth = getAuthData()!;
    
    const row = await tasksDB.queryRow<{
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
      INSERT INTO tasks (title, description, subject, start_date, due_date, priority, user_id)
      VALUES (${req.title}, ${req.description || null}, ${req.subject || null}, 
              ${req.startDate || null}, ${req.dueDate || null}, ${req.priority}, ${auth.userID})
      RETURNING *
    `;

    if (!row) {
      throw new Error("Failed to create task");
    }

    return {
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
    };
  }
);
