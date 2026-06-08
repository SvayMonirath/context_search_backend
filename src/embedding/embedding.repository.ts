import type { VectorModel } from "@prisma/client";
import prisma from "../prisma.client.js";

export default class EmbeddingRepository {
  async save_embedding(chunkID: string, embedding: number[], model: VectorModel) {
    const id = `emb_${chunkID}`;
    const vectorLiteral = `[${embedding.join(",")}]`;

    // Embedding model has an Unsupported(vector) column, so we write via raw SQL.
    await prisma.$executeRaw`
      INSERT INTO "Embedding" ("id", "chunkID", "vector", "model", "created_at")
      VALUES (${id}, ${chunkID}, ${vectorLiteral}::vector, ${model}::"VectorModel", NOW())
      ON CONFLICT ("chunkID")
      DO UPDATE SET
        "vector" = EXCLUDED."vector",
        "model" = EXCLUDED."model";
    `;

    return prisma.embedding.findUnique({
      where: { chunkID },
    });
  }
}
