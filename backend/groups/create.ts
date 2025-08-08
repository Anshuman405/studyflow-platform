import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";

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

// Creates a new study group.
export const create = api<CreateGroupRequest, StudyGroup>(
  { auth: true, expose: true, method: "POST", path: "/groups" },
  withTiming(async (req) => {
    const auth = getAuthData()!;
    
    // Generate unique join code
    const code = generateJoinCode();
    
    const group = await prisma.studyGroup.create({
      data: {
        name: req.name,
        description: req.description,
        code,
        isPublic: req.isPublic || false,
        createdBy: auth.userID,
      },
    });

    // Add creator as admin member
    await prisma.studyGroupMember.create({
      data: {
        userId: auth.userID,
        groupId: group.id,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description || undefined,
      code: group.code,
      isPublic: group.isPublic,
      createdBy: group.createdBy,
      memberCount: 1,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }, "create_study_group")
);

function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
