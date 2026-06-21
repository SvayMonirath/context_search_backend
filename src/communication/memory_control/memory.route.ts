import express from "express";
import { MemoryController } from "./memory.controller.js";
import { MemoryService } from "./memory.service.js";
import { MemoryRepository } from "./memory.repository.js";

const router: express.Router = express.Router();

const memoryRepository = new MemoryRepository();
const memoryService = new MemoryService(memoryRepository);
const memoryController = new MemoryController(memoryService);

router.get("/communication/search/:profile_id", memoryController.search_memory);

export { router as Memory_Router };
