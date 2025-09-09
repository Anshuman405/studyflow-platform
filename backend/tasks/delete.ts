import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";

interface DeleteTaskParams {
  id: number;
}

// Deletes a task.
export const deleteTask = api<DeleteTaskParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/tasks/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const res = await db.exec`
      DELETE FROM tasks
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    if (res.rowsAffected === 0) {
      throw APIError.notFound("Task not found or permission denied");
    }
  }
);
