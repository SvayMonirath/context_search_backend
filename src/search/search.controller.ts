import express from "express";

import SearchService from "./search.service.js";
import { Search_Request } from "./search.request.js";

class SearchController {
  constructor(private readonly searchService: SearchService) {}

  search = async (req: express.Request, res: express.Response) => {
    try {
      const rawQuery =
        typeof req.query.query === "string"
          ? req.query.query
          : typeof req.query.q === "string"
            ? req.query.q
            : typeof req.body?.query === "string"
              ? req.body.query
              : typeof req.body?.q === "string"
                ? req.body.q
                : undefined;

      const data = Search_Request.parse({ query: rawQuery });
      const rawLimit = req.query.limit ?? req.body?.limit;
      const limit: number | undefined = rawLimit
        ? parseInt(rawLimit as string)
        : undefined;

      const results = await this.searchService.queryVector(data, limit);
      res.status(200).json({
        status: "success",
        message: "Search completed successfully",
        data: results,
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
