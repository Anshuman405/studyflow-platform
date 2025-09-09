import { api, StreamInOut } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

interface GroupMessage {
  type: 'user_joined' | 'user_left' | 'note_updated' | 'presence_update';
  payload: any;
  senderId: string;
}

interface Handshake {
  groupId: number;
}

// Map<groupId, Set<Stream>>
const groupStreams = new Map<number, Set<StreamInOut<GroupMessage, GroupMessage>>>();

// Handles real-time collaboration for study groups.
export const collaboration = api.streamInOut<Handshake, GroupMessage, GroupMessage>(
  { auth: true, expose: true, path: "/groups/:groupId/live" },
  async (handshake, stream) => {
    const auth = getAuthData()!;
    const { groupId } = handshake;

    if (!groupStreams.has(groupId)) {
      groupStreams.set(groupId, new Set());
    }
    const streams = groupStreams.get(groupId)!;
    streams.add(stream);

    // Notify others that a user has joined
    const joinMessage: GroupMessage = { type: 'user_joined', payload: { userId: auth.userID }, senderId: auth.userID };
    for (const s of streams) {
      if (s !== stream) {
        try {
          await s.send(joinMessage);
        } catch {
          streams.delete(s);
        }
      }
    }

    try {
      for await (const message of stream) {
        // Broadcast message to all clients in the same group
        for (const s of streams) {
          try {
            await s.send({ ...message, senderId: auth.userID });
          } catch {
            streams.delete(s);
          }
        }
      }
    } finally {
      // User disconnected
      streams.delete(stream);
      if (streams.size === 0) {
        groupStreams.delete(groupId);
      }
      // Notify others that a user has left
      const leaveMessage: GroupMessage = { type: 'user_left', payload: { userId: auth.userID }, senderId: auth.userID };
      for (const s of streams) {
        try {
          await s.send(leaveMessage);
        } catch {
          streams.delete(s);
        }
      }
    }
  }
);
