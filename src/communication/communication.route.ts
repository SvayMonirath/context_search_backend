import express from "express";
import { verify_access_token } from "../authentication/authentication.middleware.js";
import CommunicationController from "./communication.controller.js";
import CommunicationService from "./communication.service.js";
import IntegrationService from "../integration/integration.service.js";
import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationRepository from "../integration/integration.repository.js";

const router: express.Router = express.Router();

const googleAuthService = new GoogleOAuthService();
const integrationRepository = new IntegrationRepository();
const integrationService = new IntegrationService(
  googleAuthService,
  integrationRepository,
);
const communicationService = new CommunicationService(
  integrationService,
  googleAuthService,
);
const communicationController = new CommunicationController(
  communicationService,
);

router.use(verify_access_token);

router.get("/get_emails/:profile_id", communicationController.get_emails);

export { router };
