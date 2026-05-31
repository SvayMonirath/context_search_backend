import app from "./app.js";
import "./message_broker/communication.worker.js";

const PORT = process.env.BACKEND_PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
