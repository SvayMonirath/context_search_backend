import { LogAction,  MemoryRuleType, MemoryScope } from '@prisma/client';
import prisma from "../../prisma.client.js";

export class MemoryRepository {
  constructor() {}

  search_memory = async (params: {
    profileID: string;
    query?: string;
    filters?: any;
    limit?: number;
    offset?: number;
  }) => {
      const { profileID, query, filters, limit, offset } = params;

      const where: any = {
        profileID,
        isDeleted: false,
      };

      // text search
      if (query) {
        where.content = {
          contains: query,
          mode: "insensitive",
        };
      }

      // filters
      if (filters?.sender) {
        where.sender = filters.sender;
      }

      if (filters?.type) {
        where.type = filters.type;
      }

      // date range
      if (filters?.dateFrom || filters?.dateTo) {
        where.sent_at = {
          gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
        };
      }

      return prisma.communication.findMany({
        where,
        orderBy: {
          sent_at: "desc",
        },
        take: limit,
        skip: offset,
      });
  }

  delete_communications = async (profileID: string, communicationIDs: string[]) => {
    return prisma.communication.updateMany({
      where: {
        id: {
          in: communicationIDs,
        },
        profileID,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  createRule = async (params: { profileID: string; type: MemoryRuleType ; value: string[]; scope: MemoryScope }) => {
    const { profileID, type, value , scope} = params;
    return await prisma.$transaction(async (prisma) => {
      const rule = await prisma.memoryRule.create({
        data: {
          profileID,
          type,
          value,
          scope,
          isActive: true,
        }
      });

      await prisma.memoryLog.create({
        data: {
          profileID,
          targetType: type,
          targetValue: value.join(","),
          action: LogAction.BLOCKED,
        }
      })
      return rule;
    })
  }

  getRules = async (profileID: string) => {
    return prisma.memoryRule.findMany({
      where: {
        profileID,
        isActive: true,
      },
      orderBy: {
        created_at: "desc",
      }
    })
  }

  deleteRule = async (profileID: string, ruleID: string) => {
    // transaction
    return await prisma.$transaction(async (prisma) => {
      const rule = await prisma.memoryRule.update({
        where: {
          id: ruleID,
        },
        data: {
          isActive: false,
        }
      })

      await prisma.memoryLog.create({
        data: {
          profileID,
          action: LogAction.DELETED,
        }
      })
      return rule;
    })
  }
}
