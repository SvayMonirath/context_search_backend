import express from "express";
import { verify_access_token } from "../authentication/authentication.middleware.js";
import CommunicationController from "./communication.controller.js";
import CommunicationService from "./communication.service.js";
import CommunicationRepository from "./communication.repository.js";
import IntegrationService from "../integration/integration.service.js";
import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationRepository from "../integration/integration.repository.js";
import { ChunkingService } from "../chunking/chunking.service.js";

const router: express.Router = express.Router();

const googleAuthService = new GoogleOAuthService();
const integrationRepository = new IntegrationRepository();
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
const communicationController = new CommunicationController(
  communicationService, integrationRepository, communicationRepository
);

router.use(verify_access_token);

// router.get("/get_emails/:profile_id", communicationController.get_emails);
router.get("/gmail/sync/:profile_id", communicationController.sync_gmail);
router.get("/telegram/sync/:profile_id", communicationController.sync_telegram);
router.get("/:profile_id/:limit/:page", communicationController.get_communications);

export { router };
