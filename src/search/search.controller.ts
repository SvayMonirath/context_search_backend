import express from "express";

import SearchService from "./search.service.js";
import RAGService from "../RAG/rag.service.js";
import { ChatService } from "../chat/chat.service.js";
import { Search_Request } from "./search.request.js";

class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly ragService: RAGService,
  ) {}

  streamSearch = async (req: express.Request, res: express.Response) => {
    try {
      const query = req.body.query;
      const profileID = req.query.profileId;
      let chatId = req.query.chatId;

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
      const result = await this.searchService.queryVector({ query }, 10, profileID as string);

      console.log("Search results found:", result.results.length);
      console.log("Search results:", result.results);
      res.write(`data: ${JSON.stringify({
        type: "status",
        stage: "generating",
        message: "Building  response from memory"
      })}\n\n`);

      console.log("Generating RAG response...");
      const stream = this.ragService.generateResponseStream(result.context, query);


      let ragStart = Date.now();

      let fullResponse = "";

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({
          type: "token",
          content: chunk,
        })}\n\n`);
        fullResponse += chunk;
      }

      await this.searchService.save_search_history(
        chatId as string,
        profileID as string,
        query,
        result.results,
        fullResponse,
      );

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


  statelessSearch = async (req: express.Request, res: express.Response) => {
    try {
      const query = req.body.query;
      const profileID = req.query.profileId as string;
      let chatId = req.query.chatId;

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.flushHeaders();

      if(!query || !profileID) {
        throw new Error("Query and profileId are required");
      }

      res.write(`data: ${JSON.stringify({
        type: "status",
        stage: "generating",
        message: "Building  response from memory"
      })}\n\n`);

      const searchStart = Date.now();

      const searchResult = await this.searchService.extractStatelessSearch(
        query,
        profileID,
      );

      const context = this.searchService.buildContext(searchResult.results);

      const stream = this.ragService.generateResponseStream(context, query);


      let ragStart = Date.now();

      let fullResponse = "";

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({
          type: "token",
          content: chunk,
        })}\n\n`);
        fullResponse += chunk;
      }

      await this.searchService.save_search_history(
        chatId as string,
        profileID as string,
        query,
        [],
        fullResponse,
      );

      const ragTime = Date.now() - ragStart;
      console.log(`RAG response generation completed in ${ragTime} ms`);
      res.write(`data: ${JSON.stringify({
        type: "done",
        sources: [],
        timings: {
          hybrid_search_time_ms: Date.now() - searchStart,
          rag_time_ms: ragTime,
        }
      })}\n\n`);

      res.end();

    } catch (error: any) {
      console.error(error);
      res.status(500).json(error.message);
    }
  }
}

export default SearchController;
