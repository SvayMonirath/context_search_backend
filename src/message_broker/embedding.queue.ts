import { Queue } from "bullmq";
import { redisConnection } from "./redis.client.js";

export const embeddingQueue = new Queue("embedding-queue", {
  connection: redisConnection,
});

export default embeddingQueue;
