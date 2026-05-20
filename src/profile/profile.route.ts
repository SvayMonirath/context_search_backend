import express from "express";
import { verify_access_token } from "../authentication/authentication.middleware.js";

import ProfileController from "./profile.controller.js";
import ProfileService from "./profile.service.js";
import ProfileRepository from "./profile.repository.js";

const router: express.Router = express.Router();

router.use(verify_access_token);

const profileRepository = new ProfileRepository();
const profileService = new ProfileService(profileRepository);
const profileController = new ProfileController(profileService);

router.post("/", profileController.create_profile);

export { router };
