import express from "express";
import IntegrationController from "./integration.controller.js";
import IntegrationService from "./integration.service.js";
import GoogleOAuthService from "./google-oauth.service.js";

const router: express.Router = express.Router();

const googleAuthService = new GoogleOAuthService();
const integrationService = new IntegrationService(googleAuthService);
const integrationController = new IntegrationController(integrationService);

router.post("/google/callback", integrationController.google_callback);

export { router };
