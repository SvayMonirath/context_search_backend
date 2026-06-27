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

import IntegrationService from "../integration/integration.service.js";
import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationRepository from "../integration/integration.repository.js";
import CommunicationService from "../communication/communication.service.js";
import CommunicationRepository from "../communication/communication.repository.js";
import { ChunkingService } from "../chunking/chunking.service.js";
import CommunicationController from "../communication/communication.controller.js";

const googleAuthService = new GoogleOAuthService();
const integrationRepository = new IntegrationRepository();

const router: express.Router = express.Router();


const integrationService = new IntegrationService(
  googleAuthService,
  integrationRepository,
);
const communicationRepository = new CommunicationRepository();
const chunkingService = new ChunkingService(communicationRepository);
const communicationService = new CommunicationService(
  integrationService,
  googleAuthService,
  communicationRepository,
  chunkingService,
  integrationRepository,
);

const searchHistoryRepository = new SearchHistoryRepository();
const searchRepository = new SearchRepository();
const embeddingRepository = new EmbeddingRepository();
const embeddingService = new EmbeddingService(embeddingRepository);
const searchService = new SearchService(searchRepository, embeddingService, searchHistoryRepository, communicationService);
const ragService = new RAGService();
const searchController = new SearchController(searchService, ragService, );

router.use(verify_access_token);

// router.post("/", searchController.search);
router.post("/stream", searchLimiter, searchController.streamSearch);
router.post("/stream/stateless", searchLimiter, searchController.statelessSearch)

export { router as Search_Router };
