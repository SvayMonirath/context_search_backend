import { CommunicationType, IntegrationType } from "@prisma/client";
import { matchesMemoryRules } from "../utils/memoryRules.utils.js";
import prisma from "../prisma.client.js";
import { UserEncryptionFactory } from "../security/user-encryption.factory.js";
import { MasterEncryptionService } from "../security/master-encryption.service.js";
import UserRepository from "../authentication/user.repository.js";

class CommunicationRepository {

  constructor(private readonly userEncryptionFactory = new UserEncryptionFactory(
    new MasterEncryptionService(),
    new UserRepository()
  )) {}

  async save_telegram_message(
    profileID: string,
    integrationID: string,
    msg: any,
    userID: string
  ) {
    try {
      const { blocked } = matchesMemoryRules(
        {
          sender: String(msg.sender_name || "Unknown"),
          content: msg.text ?? "",
          integrationID,
        },
        await prisma.memoryRule.findMany({
          where: {
            profileID,
            isActive: true,
            scope: {
              in: ["INGESTION", "BOTH"],
            },
          },
        }),
      );
      if (blocked) {
        return null;
      }



      const encryption = await this.userEncryptionFactory.create(userID);
      const encryptedContent = String(encryption.encrypt(msg.text ?? ""));
      const encryptedSender = String(encryption.encrypt(msg.sender_name ?? ""));
      const encryptedChatTitle = String(encryption.encrypt(msg.chat_title ?? "Untitled Chat"));

      return prisma.communication.upsert({
        where: {
          integrationID_externalID: {
            integrationID,
            externalID: String(msg.message_id),
          },
        },
        create: {
          profileID,
          integrationID,
          type: CommunicationType.TELEGRAM_MESSAGE,
          externalID: String(msg.message_id),
          sender: encryptedSender,
          content: encryptedContent,
          sent_at: new Date(msg.date),
          metadata: {
            chat_id: String(msg.chat_id),
            chat_title: encryptedChatTitle,
            sender_id: msg.sender_id ? String(msg.sender_id) : null,
          },
        },
        update: {},
      });
    } catch (error: any) {
      throw new Error("Failed to save telegram message: " + error.message);
    }
  }

  update_integration = async (integrationID: string, data: any) => {
    return await prisma.integration.update({
      where: {
        id: integrationID,
      },
      data: data,
    });
  }

  save_email = async (profileID: string, integrationID: string, email: any, userID: string) => {
    try {

      const { blocked } = matchesMemoryRules(
        {
          sender: email.from ?? "Unknown",
          content: email.body ?? "",
          integrationID,
        },
        await prisma.memoryRule.findMany({
          where: {
            profileID,
            isActive: true,
            scope: {
              in: ["INGESTION", "BOTH"],
            },
          },
        }),
      );

      if (blocked) {
        return null;
      }

      const encryption = await this.userEncryptionFactory.create(userID);
      const encryptedBody = String(encryption.encrypt(email.body ?? ""));
      const encryptedSubject = String(encryption.encrypt(email.subject ?? ""));
      const encryptedFrom = String(encryption.encrypt(email.from ?? ""));

      // const encryptedEmail = {
      //   ...email,
      //   body: encryptedBody,
      //   subject: encryptedSubject,
      //   from: encryptedFrom,
      // };

      const externalID = email.id ?? null;

      // If this message already exists for the same integration, refresh it
      // with the latest cleaned content instead of skipping.
      if (externalID) {
        const existingEmail = await prisma.communication.findFirst({
          where: {
            integrationID,
            externalID,
          },
        });

        if (existingEmail) {
          return prisma.communication.update({
            where: { id: existingEmail.id },
            data: {
              sender: encryptedFrom,
              content: encryptedBody,
              sent_at: Number(email.internalDate)
                ? new Date(Number(email.internalDate))
                : existingEmail.sent_at,
              metadata: {
                subject: encryptedSubject,
                snippet: email.snippet,
                labelIds: email.labelIds,
                category: email.category,
                importance: email.importance,
                indexable: email.indexable,
              },
            },
          });
        }
      }

      return prisma.communication.create({
        data: {
          profileID,
          integrationID,

          type: CommunicationType.EMAIL,
          externalID,
          sender: encryptedFrom,
          content: encryptedBody,
          sent_at: new Date(Number(email.internalDate)),
          metadata: {
            subject: encryptedSubject,
            snippet: email.snippet,
            labelIds: email.labelIds,
            category: email.category,
            importance: email.importance,
            indexable: email.indexable,
          },
        },
      });
    } catch (error: any) {
      throw new Error("Failed to save email: " + error.message);
    }
  };

  async get_by_id(communicationID: string) {
    return prisma.communication.findUnique({
      where: { id: communicationID },
    });
  }
  async delete_chunks(communicationID: string) {
    return prisma.communicationChunk.deleteMany({
      where: { communicationID },
    });
  }
  async store_chunks(
    communicationID: string,
    chunks: { chunkIndex: number; content: string }[],
  ) {
    return prisma.communicationChunk.createMany({
      data: chunks.map((chunk) => ({
        communicationID,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
      })),
    });
  }

  // Atomically replace chunks for a communication. Uses a transaction to avoid
  // leaving the communication without chunks if insertion fails.
  async replace_chunks(
    communicationID: string,
    chunks: { chunkIndex: number; content: string }[],
  ) {
    // Use a callback-style transaction so we can return the created rows.
    return prisma.$transaction(async (tx) => {
      // Remove embeddings first because Embedding -> CommunicationChunk FK is RESTRICT.
      await tx.embedding.deleteMany({
        where: {
          chunk: {
            communicationID,
          },
        },
      });

      await tx.communicationChunk.deleteMany({ where: { communicationID } });

      await tx.communicationChunk.createMany({
        data: chunks.map((chunk) => ({
          communicationID,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
        })),
        skipDuplicates: true,
      });

      // Return the newly created (or existing) chunks so callers have their IDs.
      return tx.communicationChunk.findMany({
        where: { communicationID },
        orderBy: { chunkIndex: "asc" },
      });
    });
  }

  async get_communications(profileID: string, offset: number, limit: number) {
    const [data, total] = await Promise.all([
      prisma.communication.findMany({
        where: {
          profileID,
          isDeleted: false,
        },
        include: {
          integration: {
            select: {
              type: true,
            },
          },
        },
        orderBy: {
          sent_at: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.communication.count({
        where: {
          profileID,
          isDeleted: false,
        },
      }),
    ]);

    return { data, total };
  }
}

export default CommunicationRepository;
