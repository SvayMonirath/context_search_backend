import express from "express";
import { verify_access_token } from "../authentication/authentication.middleware.js";
import { searchLimiter } from "../middlewares/rateLimit.middleware.js";

import SearchService from "./search.service.js";
import EmbeddingService from "../embedding/embedding.service.js";
import EmbeddingRepository from "../embedding/embedding.repository.js";
import SearchRepository from "./search.repository.js";
import SearchController from "./search.controller.js";
import RAGService from "../RAG/rag.service.js";
import { SearchHistoryRepository } from "./searchHisory.repository.js";

const router: express.Router = express.Router();

const searchHistoryRepository = new SearchHistoryRepository();
const searchRepository = new SearchRepository();
const embeddingRepository = new EmbeddingRepository();
const embeddingService = new EmbeddingService(embeddingRepository);
const searchService = new SearchService(searchRepository, embeddingService, searchHistoryRepository);
const ragService = new RAGService();
const searchController = new SearchController(searchService, ragService);

router.use(verify_access_token);

// router.post("/", searchController.search);
router.post("/stream", searchLimiter, searchController.streamSearch);

export { router as Search_Router };
