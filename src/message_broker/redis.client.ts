// BullMQ accepts plain connection options. Using options here avoids ioredis
// version/type mismatch issues between transitive dependencies.
export const redisConnection = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
};
