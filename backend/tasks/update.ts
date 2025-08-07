import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { tasksDB } from "./db";
import { UpdateTaskRequest, Task } from "./types";

interface UpdateTaskParams {
  id: number;
}

// Updates an existing task.
export const update = api<UpdateTaskParams & UpdateTaskRequest, Task>(
  { auth: true, expose: true, method: "PUT", path: "/tasks/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(req.title);
    }
    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(req.description || null);
    }
    if (req.subject !== undefined) {
      updates.push(`subject = $${paramIndex++}`);
      values.push(req.subject || null);
    }
    if (req.startDate !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      values.push(req.startDate || null);
    }
    if (req.dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(req.dueDate || null);
    }
    if (req.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(req.priority);
    }
    if (req.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(req.status);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.id, auth.userID);

    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;

    const row = await tasksDB.rawQueryRow<{
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
    }>(query, ...values);

    if (!row) {
      throw APIError.notFound("Task not found");
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
