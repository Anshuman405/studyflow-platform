import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";

interface DeleteTaskParams {
  id: number;
}

// Deletes a task.
export const deleteTask = api<DeleteTaskParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/tasks/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    try {
      await prisma.task.delete({
        where: {
          id: req.id,
          userId: auth.userID,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw APIError.notFound("Task not found");
      }
      throw error;
    }
  }
);
