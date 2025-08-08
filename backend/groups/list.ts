import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";

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
  withTiming(async (params) => {
    const auth = getAuthData()!;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const offset = (page - 1) * limit;

    let where: any = {};
    
    if (params.myGroups) {
      // Only groups where user is a member
      where = {
        members: {
          some: {
            userId: auth.userID,
            status: 'ACTIVE',
          },
        },
      };
    } else {
      // Public groups or groups where user is a member
      where = {
        OR: [
          { isPublic: true },
          {
            members: {
              some: {
                userId: auth.userID,
                status: 'ACTIVE',
              },
            },
          },
        ],
      };
    }

    const [groups, totalCount] = await Promise.all([
      prisma.studyGroup.findMany({
        where,
        include: {
          _count: {
            select: {
              members: {
                where: { status: 'ACTIVE' },
              },
            },
          },
          members: {
            where: {
              userId: auth.userID,
              status: 'ACTIVE',
            },
            select: {
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.studyGroup.count({ where }),
    ]);

    const formattedGroups: StudyGroup[] = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description || undefined,
      code: group.code,
      isPublic: group.isPublic,
      createdBy: group.createdBy,
      memberCount: group._count.members,
      userRole: group.members[0]?.role.toLowerCase(),
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
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
  }, "list_study_groups")
);
