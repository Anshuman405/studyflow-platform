import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";

interface DeleteEventParams {
  id: number;
}

// Deletes an event.
export const deleteEvent = api<DeleteEventParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/events/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    try {
      await prisma.event.delete({
        where: {
          id: req.id,
          userId: auth.userID,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw APIError.notFound("Event not found");
      }
      throw error;
    }
  }
);
