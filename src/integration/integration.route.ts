import express from "express";

const router: express.Router = express.Router();

router.post("/google");
router.post("/telegram");

export { router };
