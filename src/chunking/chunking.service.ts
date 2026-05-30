import CommunicationRepository from "../communication/communication.repository.js";
import type { CommunicationChunkInput } from "./chunking.type.js";
import chunkText from "./chunker.js";

const MAX_CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export class ChunkingService {
  constructor(private readonly communicationRepository: CommunicationRepository) {
    this.communicationRepository = communicationRepository;
  }

  // Public wrapper; kept small to aid testability — real logic lives in chunker.ts
  chunkText = (content: string): string[] => {
    return chunkText(content, MAX_CHUNK_SIZE, CHUNK_OVERLAP);
  };

  processCommunication = async (communicationID: string) => {
    try {
      const communication = await this.communicationRepository.get_by_id(communicationID);

      if (!communication) {
        throw new Error("Communication not found");
      }

      // Build chunks from the cleaned content
      const rawChunks = this.chunkText(communication.content ?? "");

      const structured: CommunicationChunkInput[] = rawChunks.map((chunk, index) => ({
        chunkIndex: index,
        content: chunk,
      }));

      // Replace chunks atomically (repository will handle transaction)
      await this.communicationRepository.replace_chunks(communicationID, structured);

      return structured;
    } catch (error) {
      throw new Error("Failed to process communication for chunking: " + (error as Error).message);
    }
  };
}
