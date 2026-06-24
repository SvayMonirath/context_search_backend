import express from "express";
import { verify_access_token } from "../../authentication/authentication.middleware.js";
import { MemoryController } from "./memory.controller.js";
import { MemoryService } from "./memory.service.js";
import { MemoryRepository } from "./memory.repository.js";

const router: express.Router = express.Router();

const memoryRepository = new MemoryRepository();
const memoryService = new MemoryService(memoryRepository);
const memoryController = new MemoryController(memoryService);


router.use(verify_access_token);
router.post("/communication/search/:profile_id", memoryController.search_memory);
router.post("/communication/:profile_id/delete", memoryController.delete_communications);
router.post("/profile/:profile_id/rules", memoryController.createRule);
router.get("/profile/:profile_id/rules", memoryController.getRules);
router.delete("/profile/:profile_id/rule/:rule_id", memoryController.deleteRule);

export { router as Memory_Router };
