import prisma from "../prisma.client.js";

class CommunicationRepository {
  save_email = async (profileID: string, integrationID: string, email: any) => {
    try {
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
              sender: email.from ?? existingEmail.sender,
              content: email.body ?? existingEmail.content,
              sent_at: Number(email.internalDate)
                ? new Date(Number(email.internalDate))
                : existingEmail.sent_at,
              metadata: {
                subject: email.subject,
                snippet: email.snippet,
                labelIds: email.labelIds,
              },
            },
          });
        }
      }

      return prisma.communication.create({
        data: {
          profileID,
          integrationID,

          type: "EMAIL",
          externalID,
          sender: email.from ?? "Unknown sender",
          content: email.body ?? "",
          sent_at: new Date(Number(email.internalDate)),
          metadata: {
            subject: email.subject,
            snippet: email.snippet,
            labelIds: email.labelIds,
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
}

export default CommunicationRepository;
