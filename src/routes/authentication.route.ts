import express from "express";
import { AuthenticationController } from "../controllers/authentication.controller.js";
import { AuthenticationService } from "../services/authentication.service.js";
import UserRepository from "../repositories/user.repository.js";
import PasswordService from "../services/password.service.js";

const router: express.Router = express.Router();

const user_repository = new UserRepository();
const password_service = new PasswordService();
const authentication_service = new AuthenticationService(user_repository, password_service);
const authentication_controller = new AuthenticationController(authentication_service);

router.post("/register", authentication_controller.register);
router.post("/login", authentication_controller.login);
router.post("/logout", authentication_controller.logout);

export { router };
