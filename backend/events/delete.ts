import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { eventsDB } from "./db";

interface DeleteEventParams {
  id: number;
}

// Deletes an event.
export const deleteEvent = api<DeleteEventParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/events/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    const result = await eventsDB.exec`
      DELETE FROM events 
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;
  }
);
