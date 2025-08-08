import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";

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
  withTiming(async (req) => {
    const auth = getAuthData()!;
    
    // Find group by code
    const group = await prisma.studyGroup.findUnique({
      where: { code: req.code.toUpperCase() },
    });

    if (!group) {
      throw APIError.notFound("Invalid join code");
    }

    // Check if user is already a member
    const existingMember = await prisma.studyGroupMember.findUnique({
      where: {
        userId_groupId: {
          userId: auth.userID,
          groupId: group.id,
        },
      },
    });

    if (existingMember) {
      if (existingMember.status === 'ACTIVE') {
        throw APIError.alreadyExists("You are already a member of this group");
      } else {
        // Reactivate membership
        await prisma.studyGroupMember.update({
          where: { id: existingMember.id },
          data: { status: 'ACTIVE' },
        });
      }
    } else {
      // Create new membership
      await prisma.studyGroupMember.create({
        data: {
          userId: auth.userID,
          groupId: group.id,
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      });
    }

    return {
      success: true,
      groupName: group.name,
    };
  }, "join_study_group")
);
