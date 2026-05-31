import { Queue } from 'bullmq';
import { redisConnection } from './redis.client.js';

export const communicationQueue = new Queue('communication-queue', {
  connection: redisConnection,
})
