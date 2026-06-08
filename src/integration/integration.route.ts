import express from "express";
import { verify_access_token } from "../authentication/authentication.middleware.js";
import IntegrationController from "./integration.controller.js";
import IntegrationService from "./integration.service.js";
import GoogleOAuthService from "./google-oauth.service.js";
import IntegrationRepository from "./integration.repository.js";

const router: express.Router = express.Router();

const googleAuthService = new GoogleOAuthService();
const integrationRepository = new IntegrationRepository();

const integrationService = new IntegrationService(
  googleAuthService,
  integrationRepository,
);
const integrationController = new IntegrationController(integrationService);

router.get("/google/callback", integrationController.google_callback);
router.use(verify_access_token);

router.post("/google/create_client", integrationController.create_gmail_client);
router.patch("/disconnect", integrationController.disconnect_integration);
router.delete("", integrationController.delete_integration);
router.get("/status", integrationController.get_integration_for_profile);

export { router };
