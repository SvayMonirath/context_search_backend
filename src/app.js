import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
// routes
import { router as Authentication_Router } from "./authentication/authentication.route.js";
import { router as Profile_Router } from "./profile/profile.route.js";
import { router as Integration_Router } from "./integration/integration.route.js";
import { router as Communication_Router } from "./communication/communication.route.js";
import swaggerSpec from "./swagger.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Context Search API Docs",
    swaggerOptions: {
        persistAuthorization: true,
    },
}));
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));
// register routes
app.use("/api/authentication", Authentication_Router);
app.use("/api/profile", Profile_Router);
app.use("/api/integration", Integration_Router);
app.use("/api/communication", Communication_Router);
export default app;
//# sourceMappingURL=app.js.map