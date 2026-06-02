import type z from "zod";
import { Search_Request } from "./search.request.js";

import SearchRepository from "./search.repository.js";
import EmbeddingService from "../embedding/embedding.service.js";

class SearchService {
  constructor(
    private searchRepository: SearchRepository,
    private embeddings: EmbeddingService,
  ) {}

  queryVector = async (
    data: z.infer<typeof Search_Request>,
    limit?: number,
  ) => {
    try {
      const query_vector = await this.embeddings.query_embedding(data.query);

      const candidates = await this.searchRepository.hybridSearch(
        data.query,
        query_vector,
        Math.max(limit ?? 10, 10),
      );

      const normalizedQuery = data.query.toLowerCase().trim();
      const queryTerms = normalizedQuery
        .split(/\s+/)
        .filter((term) => term.length > 2);

      const reranked = (candidates as Array<any>)
        .map((candidate) => {
          const content = String(candidate.content ?? "").toLowerCase();
          const keywordCoverage =
            queryTerms.length === 0
              ? 0
              : queryTerms.filter((term) => content.includes(term)).length /
                queryTerms.length;

          const phraseBoost = content.includes(normalizedQuery) ? 0.15 : 0;

          const finalScore =
            Number(candidate.score ?? 0) + keywordCoverage * 0.12 + phraseBoost;

          return {
            ...candidate,
            keywordCoverage,
            phraseBoost,
            finalScore,
          };
        })
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, limit ?? 10);

      return reranked;
    } catch (error) {
      throw new Error("Failed to perform semantic search");
    }
  };
}

export default SearchService;
