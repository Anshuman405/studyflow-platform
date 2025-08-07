import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";

interface CreateSessionRequest {
  taskId?: number;
  estimatedTime: number;
}

interface UpdateSessionRequest {
  sessionId: number;
  actualTime: number;
  completed: boolean;
}

interface TimerSession {
  id: number;
  taskId?: number;
  estimatedTime: number;
  actualTime?: number;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new timer session.
export const createSession = api<CreateSessionRequest, TimerSession>(
  { auth: true, expose: true, method: "POST", path: "/timer/sessions" },
  async (req) => {
    const auth = getAuthData()!;
    
    const session = await prisma.timerSession.create({
      data: {
        taskId: req.taskId,
        estimatedTime: req.estimatedTime,
        userId: auth.userID,
      },
    });

    return {
      id: session.id,
      taskId: session.taskId || undefined,
      estimatedTime: session.estimatedTime,
      actualTime: session.actualTime || undefined,
      completed: session.completed,
      userId: session.userId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
);

// Updates a timer session with actual time.
export const updateSession = api<UpdateSessionRequest, TimerSession>(
  { auth: true, expose: true, method: "PUT", path: "/timer/sessions" },
  async (req) => {
    const auth = getAuthData()!;
    
    const session = await prisma.timerSession.update({
      where: {
        id: req.sessionId,
        userId: auth.userID,
      },
      data: {
        actualTime: req.actualTime,
        completed: req.completed,
      },
    });

    return {
      id: session.id,
      taskId: session.taskId || undefined,
      estimatedTime: session.estimatedTime,
      actualTime: session.actualTime || undefined,
      completed: session.completed,
      userId: session.userId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
);
