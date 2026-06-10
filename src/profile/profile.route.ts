import express from "express";
import { verify_access_token } from "../authentication/authentication.middleware.js";

import ProfileController from "./profile.controller.js";
import ProfileService from "./profile.service.js";
import ProfileRepository from "./profile.repository.js";
import IntegrationController from "../integration/integration.controller.js";
import IntegrationService from "../integration/integration.service.js";
import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationRepository from "../integration/integration.repository.js";
import PasswordService from "../authentication/password.service.js";

const router: express.Router = express.Router();

router.use(verify_access_token);

const profileRepository = new ProfileRepository();
const passwordService = new PasswordService();
const profileService = new ProfileService(profileRepository, passwordService);
const profileController = new ProfileController(profileService);

const googleAuthService = new GoogleOAuthService();
const integrationRepository = new IntegrationRepository();
const integrationService = new IntegrationService(googleAuthService, integrationRepository);
const integrationController = new IntegrationController(integrationService);

router.post("/", profileController.create_profile);
router.get("/", profileController.get_all_profiles);
router.delete("/:profileId", profileController.delete_profile);
router.post("/:profile_id/integration/google/connect", integrationController.google_connect);
router.get("/:profile_id/integration/google/get_gmail_integration", integrationController.get_gmail_integration);
router.patch("/:profile_id/integration/google/refresh_token", integrationController.refresh_google_token);

router.post("/:profile_id/integration/telegram/connect", integrationController.telegram_connect);
router.post("/:profile_id/integration/telegram/verify", integrationController.telegram_verify);
export { router };
