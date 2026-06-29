import { LogAction,  MemoryRuleType, MemoryScope } from '@prisma/client';
import prisma from "../../prisma.client.js";
import { UserEncryptionFactory } from "../../security/user-encryption.factory.js";
import { MasterEncryptionService } from "../../security/master-encryption.service.js";
import UserRepository from "../../authentication/user.repository.js";
import { matchesMemoryRules } from "../../utils/memoryRules.utils.js";

export class MemoryRepository {
  constructor(private userEncryptionFactory = new UserEncryptionFactory(new MasterEncryptionService(), new UserRepository())) {}
  search_memory = async (params: {
    profileID: string;
    query?: string;
    filters?: any;
    limit?: number;
    offset?: number;
    userID: string;
  }) => {
    const { profileID, query, filters, limit = 20, offset = 0, userID } = params;

    const where: any = {
      profileID,
      isDeleted: false,
    };

    // ONLY safe DB filters
    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.sent_at = {
        gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
      };
    }

    // OVERFETCH because filtering happens after decrypt
    const raw = await prisma.communication.findMany({
      where,
      orderBy: {
        sent_at: "desc",
      },
      take: (limit + offset) * 5,
      skip: 0,
    });

    // decrypt
    const decrypted = await Promise.all(
      raw.map(async (item) => {
        const enc = item.content;

        const { blocked } = matchesMemoryRules(
          {
            sender: String(item.sender || "Unknown"),
            content: enc ?? "",
            integrationID: item.integrationID,
          },
          await prisma.memoryRule.findMany({
            where: {
              profileID,
              isActive: true,
              scope: {
                in: ["RETRIEVAL", "BOTH"],
              },
            },
          }),
        );

        if (blocked) {
          return { ...item, content: "[BLOCKED]", sender: "[BLOCKED]" };
        }

        return {
          ...item,
          content: enc ? await this.userEncryptionFactory
            .create(userID)
            .then((e) => e.decrypt(enc)) : "",

          sender: item.sender ? await this.userEncryptionFactory
            .create(userID)
            .then((e) => e.decrypt(item.sender)) : "",
        };

      })
    );

    // remove all null or undefined content items
    const filteredDecrypted = decrypted.filter(
      (item) => item.content !== null && item.content !== undefined
    );

    // text search (NOW WORKS because decrypted)
    const searched = query
      ? filteredDecrypted.filter((item) =>
          item.content?.toLowerCase().includes(query.toLowerCase())
        )
      : filteredDecrypted;

    // sender filter (post-decrypt safe)
    const filtered = searched.filter((item) => {
      if (filters?.sender) {
        if (!item.sender) return false;
        return item.sender
          .toLowerCase()
          .includes(filters.sender.toLowerCase());
      }

      return true;
    });

    // final sort
    const sorted = filtered.sort(
      (a, b) =>
        new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    );

    // pagination AFTER filtering
    return sorted.slice(offset, offset + limit);
  };

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
