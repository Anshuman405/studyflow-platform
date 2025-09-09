import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";

interface CreateSessionRequest {
  taskId?: number;
  estimatedTime: number;
}

interface UpdateSessionRequest {
  sessionId: number;
  actualTime: number;
  completed: boolean;
}

export interface TimerSession {
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
    
    const session = await db.queryRow<TimerSession>`
      INSERT INTO timer_sessions (task_id, estimated_time, user_id)
      VALUES (${req.taskId}, ${req.estimatedTime}, ${auth.userID})
      RETURNING *
    `;

    if (!session) {
      throw APIError.internal("Failed to create timer session");
    }

    return session;
  }
);

// Updates a timer session with actual time.
export const updateSession = api<UpdateSessionRequest, TimerSession>(
  { auth: true, expose: true, method: "PUT", path: "/timer/sessions" },
  async (req) => {
    const auth = getAuthData()!;
    
    const session = await db.queryRow<TimerSession>`
      UPDATE timer_sessions
      SET actual_time = ${req.actualTime}, completed = ${req.completed}
      WHERE id = ${req.sessionId} AND user_id = ${auth.userID}
      RETURNING *
    `;

    if (!session) {
      throw APIError.notFound("Timer session not found or permission denied");
    }

    return session;
  }
);
