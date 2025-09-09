import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { UpdateTaskRequest, Task } from "./types";

interface UpdateTaskParams {
  id: number;
}

// Updates an existing task.
export const update = api<UpdateTaskParams & UpdateTaskRequest, Task>(
  { auth: true, expose: true, method: "PUT", path: "/tasks/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const { id, ...updateData } = req;

    if (Object.keys(updateData).length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    const fields = Object.keys(updateData).map((key, i) => {
      const typedKey = key as keyof UpdateTaskRequest;
      // Convert camelCase to snake_case for DB
      const snakeKey = typedKey.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      let value = updateData[typedKey];
      if ((typedKey === 'priority' || typedKey === 'status') && typeof value === 'string') {
        value = value.toUpperCase().replace('-', '_');
      }
      return { col: snakeKey, val: value };
    });

    const setClause = fields.map((f, i) => `${f.col} = $${i + 1}`).join(', ');
    const queryParams = fields.map(f => f.val);

    const task = await db.rawQueryRow<Task>(`
      UPDATE tasks
      SET ${setClause}
      WHERE id = $${queryParams.length + 1} AND user_id = $${queryParams.length + 2}
      RETURNING *
    `, ...queryParams, id, auth.userID);

    if (!task) {
      throw APIError.notFound("Task not found or permission denied");
    }

    return {
      ...task,
      priority: task.priority.toLowerCase() as any,
      status: task.status.toLowerCase().replace('_', '_') as any,
    };
  }
);
