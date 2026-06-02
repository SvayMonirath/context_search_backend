import { Worker } from "bullmq";
import { redisConnection } from "./redis.client.js";
import { ChunkingService } from "../chunking/chunking.service.js";
import CommunicationRepository from "../communication/communication.repository.js";

const communicationRepository = new CommunicationRepository();
const chunkingService = new ChunkingService(
  communicationRepository,
);

export const communicationWorker = new Worker(
  // The name of the queue to listen to
  "communication-queue",
  async (job) => {
    // Determine the type of job and process accordingly
    if (job.name === "chunk-communication") {
      const { communicationID } = job.data;

      if (!communicationID) {
        throw new Error("Communication ID is required for chunking");
      }

      await chunkingService.processCommunication(communicationID);
    }
  },
  {
    connection: redisConnection,
    concurrency: Number(process.env.COMMUNICATION_WORKER_CONCURRENCY) || 5,
  },
);
