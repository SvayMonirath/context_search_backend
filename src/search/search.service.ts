import type z from "zod";
import pLimit from "p-limit";
import { Search_Request } from "./search.request.js";
import SearchRepository from "./search.repository.js";
import { SearchHistoryRepository } from "./searchHisory.repository.js";
import EmbeddingService from "../embedding/embedding.service.js";
import CommunicationService from "../communication/communication.service.js";

import { MasterEncryptionService } from "../security/master-encryption.service.js";
import UserRepository from "../authentication/user.repository.js";
import { UserEncryptionFactory } from "../security/user-encryption.factory.js";

class SearchService {
  constructor(
    private searchRepository: SearchRepository,
    private embeddingService: EmbeddingService,
    private searchHistoryRepository: SearchHistoryRepository,
    private communicationService: CommunicationService,
    private userEncryptionFactory: UserEncryptionFactory = new UserEncryptionFactory(
      new MasterEncryptionService(),
      new UserRepository(),
    ),
  ) {}

  save_search_history = async (
    chatId: string,
    profileID: string,
    query: string,
    results: any[],
    response: string,
    userID: string,
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
    userID: string,
  ) => {
    try {
      const queryVector = await this.embeddingService.query_embedding(data.query);

      const encryptedCandidates = await this.searchRepository.hybridSearch(
        data.query,
        queryVector,
        limit,
        profileID,
      );
      const safeDecrypt = async (value: any) => {
        if (!value || typeof value !== "string") return value;

        try {
          return await encryption.decrypt(value);
        } catch (err) {
          // fallback: assume already plaintext or corrupted legacy data
          return value;
        }
      };
      const encryption = await this.userEncryptionFactory.create(userID);

      const candidates = await Promise.all(
        encryptedCandidates.map(async (c) => ({
          ...c,
          content: await safeDecrypt(c.content),
          sender: await safeDecrypt(c.sender),
        })),
      );

      const normalizedQuery = data.query.toLowerCase().trim();

      const queryTerms = normalizedQuery
        .split(/\s+/)
        .filter((term) => term.length > 2);

      const reranked = candidates
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

          // lexical scoring (NOW VALID because decrypted)
          const keywordCoverage =
            queryTerms.length === 0
              ? 0
              : queryTerms.filter((term) => searchableText.includes(term)).length /
                queryTerms.length;

          const phraseBoost = searchableText.includes(normalizedQuery) ? 0.1 : 0;

          const lexicalScore = keywordCoverage * 0.2 + phraseBoost;

          // final score = vector + lexical
          const finalScore =
            Number(candidate.vector_score ?? 0) * 0.75 + lexicalScore;

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

  private async rank(query: string, items: any[]) {
    const queryEmbedding = await this.embeddingService.query_embedding(query);

    const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);

    // Limit embedding requests to 5 at a time
    const limit = pLimit(5);

    const ranked = await Promise.all(
      items.map((item) =>
        limit(async () => {
          const chunkEmbedding = await this.embeddingService.query_embedding(
            item.chunk,
          );

          const semantic = this.cosineSimilarity(
            queryEmbedding,
            chunkEmbedding,
          );

          const text = item.chunk.toLowerCase();

          const overlap = keywords.filter((k) => text.includes(k)).length;

          const keywordScore = overlap / Math.max(keywords.length, 1);

          const ageHours = (Date.now() - item.doc.timestamp) / (1000 * 60 * 60);

          let recency = 0;

          if (ageHours < 24) recency = 0.1;
          else if (ageHours < 72) recency = 0.05;

          return {
            ...item,
            semantic,
            keywordScore,
            recency,
            score: semantic * 0.75 + keywordScore * 0.2 + recency,
          };
        }),
      ),
    );

    return ranked.sort((a, b) => b.score - a.score);
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
  private cosineSimilarity(a: number[], b: number[]) {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  extractStatelessSearch = async (query: string, profileID: string) => {
    const parsed = this.parseQuery(query);

    const [gmail, telegram] = await Promise.all([
      this.communicationService.fetchGmailCandidates(profileID, parsed),
      this.communicationService.fetchTelegramCandidates(profileID, parsed),
    ]);

    console.log(`Fetched ${gmail.length} Gmail candidates and ${telegram.length} Telegram candidates for profileID: ${profileID}`,);

    const candidates = [...gmail, ...telegram];

    const normalized = this.normalizeCandidates(candidates);

    const chunks = this.chunk(normalized);

    const ranked = await this.rank(query, chunks);

    const topK = Number(process.env.STATELESS_SEARCH_TOP_K ?? 10);

    return {
      query,
      results: ranked.slice(0, topK),
    };
  };
}

export default SearchService;
