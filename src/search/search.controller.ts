import express from "express";

import SearchService from "./search.service.js";
import RAGService from "../RAG/rag.service.js";
import { Search_Request } from "./search.request.js";

class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly ragService: RAGService,
  ) {}

  // search = async (req: express.Request, res: express.Response) => {
  //   try {
  //     const rawQuery = req.query.q || req.query.query || req.body.query;

  //     const data = Search_Request.parse({ query: rawQuery });
  //     const rawLimit =
  //       process.env.HYBRID_SEARCH_TOP_K ?? req.query.limit ?? req.body.limit;
  //     const limit: number | undefined = rawLimit
  //       ? parseInt(rawLimit as string)
  //       : undefined;

  //     const startTime = Date.now();
  //     const results = await this.searchService.queryVector(data, limit);
  //     const endTime = Date.now();
  //     const hybrid_search_time = ((endTime - startTime) / 1000).toFixed(2);

  //     const context = results.context;

  //     const ragStartTime = Date.now();
  //     const ragResponse = await this.ragService.generateResponse(
  //       context,
  //       data.query,
  //     );
  //     const ragEndTime = Date.now();
  //     const rag_time = ((ragEndTime - ragStartTime) / 1000).toFixed(2);

  //     res.status(200).json({
  //       status: "success",
  //       message: "Search completed successfully",
  //       data: {
  //         response: ragResponse,
  //         context: context,
  //         query: data.query,
  //         times: {
  //           hybrid_search_time_ms: hybrid_search_time,
  //           rag_time_ms: rag_time,
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     const message =
  //       error instanceof Error ? error.message : "Invalid request data";
  //     res.status(400).json({
  //       error: "Invalid request data",
  //       details: message,
  //       hint: "Use ?query=your text or ?q=your text (query string preferred)",
  //     });
  //   }
  // };

  streamSearch = async (req: express.Request, res: express.Response) => {
    try {
      const query = req.body.query;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.flushHeaders();

      console.log("Received search query:", query);
      // 1. SEND IMMEDIATE FEEDBACK (THIS IS KEY)
      res.write(`data: ${JSON.stringify({
        type: "status",
        stage: "searching",
        message: "Searching your memory..."
      })}\n\n`);

      // 2. run vector search
      const searchStart = Date.now();
      const result = await this.searchService.queryVector({ query });

      console.log("Search results found:", result.results.length);
      res.write(`data: ${JSON.stringify({
        type: "status",
        stage: "generating",
        message: "Building answer with AI..."
      })}\n\n`);

      console.log("Generating RAG response...");
      const stream = this.ragService.generateResponseStream(result.context, query);

      let ragStart = Date.now();

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({
          type: "token",
          content: chunk,
        })}\n\n`);
      }

      const ragTime = Date.now() - ragStart;
      console.log(`RAG response generation completed in ${ragTime} ms`);
      res.write(`data: ${JSON.stringify({
        type: "done",
        sources: result.results,
        timings: {
          hybrid_search_time_ms: Date.now() - searchStart,
          rag_time_ms: ragTime,
        }
      })}\n\n`);

      res.end();

    } catch (error) {
      console.error(error);

      res.write(`data: ${JSON.stringify({
        type: "error",
        content: "Search failed"
      })}\n\n`);

      res.end();
    }
  };
}

export default SearchController;
