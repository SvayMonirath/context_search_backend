import { Worker } from "bullmq";
import { redisConnection } from "./redis.client.js";
import prisma from "../prisma.client.js";
import EmbeddingRepository from "../embedding/embedding.repository.js";
import EmbeddingService from "../embedding/embedding.service.js";

const embeddingRepository = new EmbeddingRepository();
const embeddingService = new EmbeddingService(embeddingRepository);

export const embeddingWorker = new Worker(
  "embedding-queue",
  async (job) => {
    if (job.name === "embed-chunks") {
      const { chunkIDs } = job.data as { chunkIDs: string[] };
      if (!Array.isArray(chunkIDs) || chunkIDs.length === 0) {
        return;
      }

      for (const chunkID of chunkIDs) {
        const chunk = await prisma.communicationChunk.findUnique({
          where: { id: chunkID },
        });

        if (!chunk) continue;

        try {
          await embeddingService.embed(chunkID, chunk.content ?? "");
        } catch (err) {
          console.error("Failed to embed chunk", chunkID, err);
          throw err;
        }
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: Number(process.env.EMBED_WORKER_CONCURRENCY) || 2,
  },
);

export default embeddingWorker;
