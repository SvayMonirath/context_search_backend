import { IntegrationType } from '@prisma/client';
import prisma from "../../prisma.client.js";

export class MemoryRepository {
  constructor() {}

  search_memory = async (params: {
    profileID: string;
    query?: string;
    filter?: any;
    limit?: number;
    offset?: number;
  }) => {
      const { profileID, query, filter, limit, offset } = params;

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
      if (filter?.sender) {
        where.sender = filter.sender;
      }

      if (filter?.type) {
        where.type = filter.type;
      }

      // date range
      if (filter?.dateFrom || filter?.dateTo) {
        where.sent_at = {
          gte: filter.dateFrom ? new Date(filter.dateFrom) : undefined,
          lte: filter.dateTo ? new Date(filter.dateTo) : undefined,
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
}
