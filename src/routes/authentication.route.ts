import express from "express";
import { AuthenticationController } from "../controllers/authentication.controller.js";
import { AuthenticationService } from "../services/authentication.service.js";
import UserRepository from "../repositories/user.repository.js";

const router: express.Router = express.Router();

const user_repository = new UserRepository();
const authentication_service = new AuthenticationService(user_repository);
const authentication_controller = new AuthenticationController(authentication_service);

router.post("/register", authentication_controller.register);

export { router };
