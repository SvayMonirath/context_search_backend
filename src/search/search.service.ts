import type z from "zod";
import { Search_Request } from "./search.request.js";
import SearchRepository from "./search.repository.js";
import { SearchHistoryRepository } from "./searchHisory.repository.js";
import EmbeddingService from "../embedding/embedding.service.js";
import type CommunicationService from "../communication/communication.service.js";
import type CommunicationController from "../communication/communication.controller.js";

class SearchService {
  constructor(
    private searchRepository: SearchRepository,
    private embeddings: EmbeddingService,
    private searchHistoryRepository: SearchHistoryRepository,
    private communicationService: CommunicationService,
    private communicationController: CommunicationController,
  ) {}

  save_search_history = async (
    chatId: string,
    profileID: string,
    query: string,
    results: any[],
    response: string,
  ) => {
    await this.searchHistoryRepository.save_search_history(
      chatId,
      profileID,
      query,
      results,
      response,
    );
  };

  queryVector = async (
    data: z.infer<typeof Search_Request>,
    limit: number = process.env.QUERY_LIMIT
      ? parseInt(process.env.QUERY_LIMIT)
      : 10,
    profileID: string,
  ) => {
    try {
      const queryVector = await this.embeddings.query_embedding(data.query);

      const candidates = await this.searchRepository.hybridSearch(
        data.query,
        queryVector,
        limit,
        profileID,
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
            candidate.chat_title,
            candidate.type,
            candidate.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const keywordCoverage =
            queryTerms.length === 0
              ? 0
              : queryTerms.filter((term) => searchableText.includes(term))
                  .length / queryTerms.length;

          const phraseBoost = searchableText.includes(normalizedQuery)
            ? 0.1
            : 0;

          const finalScore =
            Number(candidate.score ?? 0) + keywordCoverage * 0.15 + phraseBoost;

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
        .map((item) => {
          const isTelegram = item.type === "telegram";

          return `Sender: ${item.sender ?? "Unknown"}
  ${isTelegram ? `Chat: ${item.chat_title ?? "Unknown Chat"}` : ""}
  Type: ${item.type ?? "Unknown"}
  Subject: ${item.subject ?? "No Subject"}
  Date: ${item.sent_at ?? "Unknown"}
  Category: ${item.category ?? "Unknown"}

  Content:
  ${item.content}`;
        })
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

  private parseQuery(query: string) {
    const q = query.toLocaleLowerCase();

    return {
      raw: query,
      keywords: q.split(" ").filter((w) => w.length > 2),
    };
  }

  private normalizeCandidates(docs: any[]) {
    return docs.map((doc) => ({
      id: doc.id,
      platform: doc.platform,
      content: doc.content || doc.body || "",
      sender: doc.sender || "unknown",
      timestamp: doc.timestamp || Date.now(),
    }));
  }

  private chunk(docs: any[]) {
    return docs.flatMap((doc) => {
      const chunks = this.splitText(doc.content);

      return chunks.map((chunk) => ({
        doc,
        chunk,
      }));
    });
  }

  private splitText(text: string) {
    return text.match(/.{1,250}/g) || [text];
  }

  private rank(query: string, items: any[]) {
    const q = query.toLowerCase();
    const keywords = q.split(" ");

    const scored = items.map((item) => {
      let score = 0;

      const text = item.chunk.toLowerCase();

      // 1. keyword overlap
      const overlap = keywords.filter((k) => text.includes(k)).length;
      score += overlap * 2;

      // 2. full query match boost
      if (text.includes(q)) score += 3;

      // 3. recency boost (stateless still uses timestamp)
      const ageHours = (Date.now() - item.doc.timestamp) / (1000 * 60 * 60);

      if (ageHours < 24) score += 2;
      if (ageHours < 72) score += 1;

      // 4. sender importance (simple heuristic)
      if (item.doc.sender?.toLowerCase().includes("dara")) {
        score += 1;
      }

      return {
        doc: item.doc,
        chunk: item.chunk,
        score,
      };
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  buildContext(results: any[]) {
    return results
      .map((r) => {
        const doc = r.doc;

        const isTelegram = doc.platform === "telegram";

        return `
  Sender: ${doc.sender ?? "Unknown"}
  ${isTelegram ? `Chat: ${doc.chat_title ?? "Unknown Chat"}` : ""}
  Type: ${doc.platform}
  Date: ${new Date(doc.timestamp).toISOString()}

  Content:
  ${r.chunk}
        `.trim();
      })
      .join("\n\n---\n\n");
  }

  extractStatelessSearch = async (query: string, profileID: string) => {
    const parsed = this.parseQuery(query);

    const [gmail, telegram] = await Promise.all([
      this.communicationService.fetchGmailCandidates(profileID, parsed),
      this.communicationController.fetchTelegramCandidates(profileID, parsed),
    ]);

    const candidates = [...gmail, ...telegram];

    const normalized = this.normalizeCandidates(candidates);
    const chunks = this.chunk(normalized);
    const ranked = this.rank(query, chunks);

    const top_k = process.env.STATELESS_SEARCH_TOP_K
      ? parseInt(process.env.STATELESS_SEARCH_TOP_K)
      : 10;

    return {
      query,
      results: ranked.slice(0, top_k),
    };
  };
}

export default SearchService;
