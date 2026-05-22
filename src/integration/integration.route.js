import express from "express";
import { verify_access_token } from "../authentication/authentication.middleware.js";
import IntegrationController from "./integration.controller.js";
import IntegrationService from "./integration.service.js";
import GoogleOAuthService from "./google-oauth.service.js";
import IntegrationRepository from "./integration.repository.js";
const router = express.Router();
const googleAuthService = new GoogleOAuthService();
const integrationRepository = new IntegrationRepository();
const integrationService = new IntegrationService(googleAuthService, integrationRepository);
const integrationController = new IntegrationController(integrationService);
router.get("/google/callback", integrationController.google_callback);
router.post("/google/create_client", verify_access_token, integrationController.create_gmail_client);
export { router };
//# sourceMappingURL=integration.route.js.map
