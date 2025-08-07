import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { UpdateTaskRequest, Task } from "./types";

interface UpdateTaskParams {
  id: number;
}

// Updates an existing task.
export const update = api<UpdateTaskParams & UpdateTaskRequest, Task>(
  { auth: true, expose: true, method: "PUT", path: "/tasks/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const updateData: any = {};
    
    if (req.title !== undefined) updateData.title = req.title;
    if (req.description !== undefined) updateData.description = req.description;
    if (req.subject !== undefined) updateData.subject = req.subject;
    if (req.startDate !== undefined) updateData.startDate = req.startDate;
    if (req.dueDate !== undefined) updateData.dueDate = req.dueDate;
    if (req.priority !== undefined) updateData.priority = req.priority.toUpperCase();
    if (req.status !== undefined) updateData.status = req.status.toUpperCase().replace('_', '_');

    if (Object.keys(updateData).length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    try {
      const task = await prisma.task.update({
        where: {
          id: req.id,
          userId: auth.userID,
        },
        data: updateData,
      });

      return {
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
      };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw APIError.notFound("Task not found");
      }
      throw error;
    }
  }
);
