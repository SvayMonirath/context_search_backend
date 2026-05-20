import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// routes
import { router as Authentication_Router } from "./authentication/authentication.route.js";
import { router as Profile_Router } from "./profile/profile.route.js";

dotenv.config();
const app: express.Application = express();

app.use(express.json());
app.use(cookieParser());

// register routes
app.use("/api/authentication", Authentication_Router);
app.use("/api/profile", Profile_Router);

export default app;
