import CommunicationRepository from "../communication/communication.repository.js";
import { embeddingQueue } from "../message_broker/embedding.queue.js";
import type { CommunicationChunkInput } from "./chunking.type.js";
import chunkText from "./chunker.js";

import { MasterEncryptionService } from "../security/master-encryption.service.js";
import UserRepository from "../authentication/user.repository.js";
import { UserEncryptionFactory } from "../security/user-encryption.factory.js";

const MAX_CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export class ChunkingService {
  constructor(
    private readonly communicationRepository: CommunicationRepository,
    private readonly userEncryptionFactory = new UserEncryptionFactory(
      new MasterEncryptionService(),
      new UserRepository(),
    ),
  ) {
  }

  // Public wrapper; kept small to aid testability — real logic lives in chunker.ts
  chunkText = (content: string): string[] => {
    return chunkText(content, MAX_CHUNK_SIZE, CHUNK_OVERLAP);
  };

  processCommunicationChunks = async (communicationID: string, userID: string) => {
    try {
      const communication: any =
        await this.communicationRepository.get_by_id(communicationID);

      const encryption = await this.userEncryptionFactory.create(userID);
      const decryptedContent = encryption.decrypt(communication.content ?? "");

      if (!communication) {
        throw new Error("Communication not found");
      }

      // Build chunks from the cleaned content
      const rawChunks = this.chunkText(decryptedContent);

      const structured: CommunicationChunkInput[] = rawChunks.map(
        (chunk, index) => ({
          chunkIndex: index,
          content: chunk,
        }),
      );

      // Replace chunks atomically (repository will handle transaction)
      const createdChunks = await this.communicationRepository.replace_chunks(
        communicationID,
        structured,
      );

      // Enqueue embedding job for the newly persisted chunks (worker will compute vectors)
      const chunkIDs = createdChunks.map((c) => c.id);
      if (chunkIDs.length > 0) {
        await embeddingQueue.add("embed-chunks", { chunkIDs }, { attempts: 3 });
      }

      return structured;
    } catch (error) {
      throw new Error(
        "Failed to process communication for chunking: " +
          (error as Error).message,
      );
    }
  };
}
