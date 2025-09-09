import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";

interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  code: string;
  isPublic: boolean;
  createdBy: string;
  memberCount: number;
  userRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ListGroupsParams {
  page?: Query<number>;
  limit?: Query<number>;
  myGroups?: Query<boolean>;
}

interface ListGroupsResponse {
  groups: StudyGroup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Lists study groups.
export const list = api<ListGroupsParams, ListGroupsResponse>(
  { auth: true, expose: true, method: "GET", path: "/groups" },
  async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const offset = (page - 1) * limit;

    let whereClause: string;
    if (params.myGroups) {
      whereClause = `WHERE sg.id IN (SELECT group_id FROM study_group_members WHERE user_id = '${auth.userID}' AND status = 'ACTIVE')`;
    } else {
      whereClause = `WHERE sg.is_public = TRUE OR sg.id IN (SELECT group_id FROM study_group_members WHERE user_id = '${auth.userID}' AND status = 'ACTIVE')`;
    }

    const groups = await db.queryAll<StudyGroup>`
      SELECT
        sg.id,
        sg.name,
        sg.description,
        sg.code,
        sg.is_public,
        sg.created_by,
        sg.created_at,
        sg.updated_at,
        (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id AND status = 'ACTIVE') as member_count,
        (SELECT role FROM study_group_members WHERE group_id = sg.id AND user_id = ${auth.userID}) as user_role
      FROM study_groups sg
      ${whereClause}
      ORDER BY sg.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await db.queryRow<{ count: string }>`
      SELECT COUNT(*) FROM study_groups sg ${whereClause}
    `;
    const totalCount = parseInt(totalResult?.count || "0", 10);

    const formattedGroups = groups.map(group => ({
      ...group,
      userRole: group.userRole?.toLowerCase(),
    }));

    return {
      groups: formattedGroups,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  }
);
