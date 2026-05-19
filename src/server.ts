import  app from "./app.js"
import dotenv from "dotenv"

// routes
import { router as Authentication_Router } from "./routes/authentication.route.js";

dotenv.config();

const PORT = process.env.BACKEND_PORT ?? 3000;

// register routes
app.use("/api/authentication", Authentication_Router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
