import express from "express";

import SearchService from "./search.service.js";
import RAGService from "../RAG/rag.service.js";
import { Search_Request } from "./search.request.js";

class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly ragService: RAGService,
  ) {}

  search = async (req: express.Request, res: express.Response) => {
    try {
      const rawQuery = req.query.q || req.query.query || req.body.query;

      const data = Search_Request.parse({ query: rawQuery });
      const rawLimit =
        process.env.HYBRID_SEARCH_TOP_K ?? req.query.limit ?? req.body.limit;
      const limit: number | undefined = rawLimit
        ? parseInt(rawLimit as string)
        : undefined;

      const startTime = Date.now();
      const results = await this.searchService.queryVector(data, limit);
      const endTime = Date.now();
      const hybrid_search_time = ((endTime - startTime) / 1000).toFixed(2);

      const context = results.context;

      const ragStartTime = Date.now();
      const ragResponse = await this.ragService.generateResponse(
        context,
        data.query,
      );
      const ragEndTime = Date.now();
      const rag_time = ((ragEndTime - ragStartTime) / 1000).toFixed(2);

      res.status(200).json({
        status: "success",
        message: "Search completed successfully",
        data: {
          response: ragResponse,
          context: context,
          query: data.query,
          times: {
            hybrid_search_time_ms: hybrid_search_time,
            rag_time_ms: rag_time,
          },
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid request data";
      res.status(400).json({
        error: "Invalid request data",
        details: message,
        hint: "Use ?query=your text or ?q=your text (query string preferred)",
      });
    }
  };
}

export default SearchController;
