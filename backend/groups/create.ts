import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";

interface CreateGroupRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  code: string;
  isPublic: boolean;
  createdBy: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Creates a new study group.
export const create = api<CreateGroupRequest, StudyGroup>(
  { auth: true, expose: true, method: "POST", path: "/groups" },
  async (req) => {
    const auth = getAuthData()!;
    
    const code = generateJoinCode();
    
    const tx = await db.begin();
    try {
      const group = await tx.queryRow<{ id: number; name: string; description?: string; code: string; isPublic: boolean; createdBy: string; createdAt: Date; updatedAt: Date; }>`
        INSERT INTO study_groups (name, description, code, is_public, created_by)
        VALUES (${req.name}, ${req.description}, ${code}, ${req.isPublic || false}, ${auth.userID})
        RETURNING *
      `;

      if (!group) {
        throw APIError.internal("Failed to create study group");
      }

      // Add creator as admin member
      await tx.exec`
        INSERT INTO study_group_members (user_id, group_id, role, status)
        VALUES (${auth.userID}, ${group.id}, 'ADMIN', 'ACTIVE')
      `;

      await tx.commit();

      return {
        ...group,
        memberCount: 1,
      };
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }
);
