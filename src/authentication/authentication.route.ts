import express from "express";

import { verify_access_token } from "./authentication.middleware.js";
import { AuthenticationController } from "./authentication.controller.js";
import { AuthenticationService } from "./authentication.service.js";
import { UserEncryptionFactory } from "../security/user-encryption.factory.js";
import UserRepository from "./user.repository.js";
import PasswordService from "./password.service.js";
import { MasterEncryptionService } from "../security/master-encryption.service.js";

const router: express.Router = express.Router();
const user_repository = new UserRepository();
const masterEncryptionKey = new MasterEncryptionService();

const user_encryption_factory = new UserEncryptionFactory(masterEncryptionKey, user_repository);

const password_service = new PasswordService();
const authentication_service = new AuthenticationService(
  user_repository,
  password_service,
  user_encryption_factory,
);
const authentication_controller = new AuthenticationController(
  authentication_service,
);

router.post("/register", authentication_controller.register);
router.post("/login", authentication_controller.login);
router.post("/logout", authentication_controller.logout);
router.get("/me", verify_access_token, authentication_controller.get_current_user);

export { router };
