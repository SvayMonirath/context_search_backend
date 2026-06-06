import { pipeline } from "@xenova/transformers";
import EmbeddingRepository from "./embedding.repository.js";
import type { VectorModel } from "@prisma/client";

class EmbeddingService {
  constructor(private readonly embeddingRepository: EmbeddingRepository) {
    this.embeddingRepository = embeddingRepository;
  }
  private extractor: any = null;

  async init() {
    if (!this.extractor) {
      this.extractor = await pipeline(
        "feature-extraction",
        process.env.EMBEDDING_MODEL
      );
    }
  }

  // Compute and persist an embedding for a given chunk ID and text.
  async embed(
    chunkID: string,
    text: string,
    model: VectorModel
  ): Promise<number[]> {
    await this.init();
    const output = await this.extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    const vector = Array.from(output.data as Float32Array) as number[];

    await this.embeddingRepository.save_embedding(chunkID, vector, model);

    return vector;
  }

  async query_embedding(query: string): Promise<number[]> {
    await this.init();
    const output = await this.extractor(query, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data as Float32Array) as number[];
  }
}

export default EmbeddingService;


