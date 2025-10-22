import { createServer } from "http";
import app from "./app";
import { setupSocket } from "./sockets/message.gateway";
import "./config/db.config";

const server = createServer(app);
setupSocket(server); // Khởi tạo socket.io

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`Message Service running on port ${PORT}`));