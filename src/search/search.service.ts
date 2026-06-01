import type z from "zod";
import { Search_Request } from "./search.request.js";

import SearchRepository from "./search.repository.js";
import EmbeddingService from "../embedding/embedding.service.js";

class SearchService {
  constructor(
    private searchRepository: SearchRepository,
    private embeddings: EmbeddingService,
  ) {}

  queryVector = async (data: z.infer<typeof Search_Request>, limit?: number) => {
    try {
      const query_vector = await this.embeddings.query_embedding(data.query);
      const contents = await this.searchRepository.semanticSearch(query_vector, limit);

      return contents;
    } catch (error) {
      throw new Error("Failed to perform semantic search");
    }
  };
}

export default SearchService;
