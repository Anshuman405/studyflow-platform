import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { CreateTaskRequest, Task } from "./types";

// Creates a new task.
export const create = api<CreateTaskRequest, Task>(
  { auth: true, expose: true, method: "POST", path: "/tasks" },
  async (req) => {
    const auth = getAuthData()!;
    
    const task = await db.queryRow<Task>`
      INSERT INTO tasks (title, description, subject, start_date, due_date, priority, user_id)
      VALUES (${req.title}, ${req.description}, ${req.subject}, ${req.startDate}, ${req.dueDate}, ${req.priority.toUpperCase()}, ${auth.userID})
      RETURNING *
    `;

    if (!task) {
      throw APIError.internal("Failed to create task");
    }

    return {
      ...task,
      priority: task.priority.toLowerCase() as any,
      status: task.status.toLowerCase().replace('_', '_') as any,
    };
  }
);
