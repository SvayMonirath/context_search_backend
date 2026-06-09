import express from "express";
import { createChatLimiter } from "../middlewares/rateLimit.middleware.js";
import { verify_access_token } from "../authentication/authentication.middleware.js";
import { ChatController } from "./chat.controller.js";
import { ChatService } from "./chat.service.js";
import { ChatRepository } from "./chat.repository.js";

const router: express.Router = express.Router();

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

router.use(verify_access_token);

router.post("/", createChatLimiter, chatController.createChat);
router.get("/get_chats", chatController.getChats);
router.get("/get_conversations", chatController.getConversations);

export { router as Chat_Router };

