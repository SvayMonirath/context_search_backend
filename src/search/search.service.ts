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
    limit: number = 10,
  ) => {
    try {
      const queryVector = await this.embeddings.query_embedding(data.query);

      const candidates = await this.searchRepository.hybridSearch(
        data.query,
        queryVector,
        limit,
      );

      const normalizedQuery = data.query.toLowerCase().trim();

      const queryTerms = normalizedQuery
        .split(/\s+/)
        .filter((term) => term.length > 2);

      const reranked = (candidates as Array<any>)
        .map((candidate) => {
          const searchableText = [
            candidate.content,
            candidate.sender,
            candidate.subject,
            candidate.type,
            candidate.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const keywordCoverage =
            queryTerms.length === 0
              ? 0
              : queryTerms.filter((term) =>
                  searchableText.includes(term),
                ).length / queryTerms.length;

          const phraseBoost = searchableText.includes(normalizedQuery)
            ? 0.1
            : 0;

          const finalScore =
            Number(candidate.score ?? 0) +
            keywordCoverage * 0.15 +
            phraseBoost;

          return {
            ...candidate,
            keywordCoverage,
            phraseBoost,
            finalScore,
          };
        })
        .sort((a, b) => b.finalScore - a.finalScore);

      const finalResults = reranked.slice(0, limit);

      const context = finalResults
        .map(
          (item) => `Sender: ${item.sender ?? "Unknown"}
Type: ${item.type ?? "Unknown"}
Subject: ${item.subject ?? "No Subject"}
Date: ${item.sent_at ?? "Unknown"}
Category: ${item.category ?? "Unknown"}

Content:
${item.content}`,
        )
        .join("\n\n---\n\n");

      return {
        results: finalResults,
        context,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to perform semantic search");
    }
  };
}

export default SearchService;
