import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";

interface JoinGroupRequest {
  code: string;
}

interface JoinGroupResponse {
  success: boolean;
  groupName: string;
}

// Joins a study group using a join code.
export const join = api<JoinGroupRequest, JoinGroupResponse>(
  { auth: true, expose: true, method: "POST", path: "/groups/join" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Find group by code
    const group = await db.queryRow<{ id: number; name: string; }>`
      SELECT id, name FROM study_groups WHERE code = ${req.code.toUpperCase()}
    `;

    if (!group) {
      throw APIError.notFound("Invalid join code");
    }

    // Upsert membership
    await db.exec`
      INSERT INTO study_group_members (user_id, group_id, role, status)
      VALUES (${auth.userID}, ${group.id}, 'MEMBER', 'ACTIVE')
      ON CONFLICT (user_id, group_id) DO UPDATE
      SET status = 'ACTIVE', updated_at = NOW()
      WHERE study_group_members.status != 'ACTIVE'
    `;

    return {
      success: true,
      groupName: group.name,
    };
  }
);
