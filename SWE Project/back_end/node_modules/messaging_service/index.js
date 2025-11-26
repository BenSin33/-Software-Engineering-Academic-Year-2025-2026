const { createServer } = require("http");
const app = require("./app");
const { setupSocket } = require("./sockets/message.gateway");
require("./configs/db.config");

const server = createServer(app);
setupSocket(server); // Khởi tạo socket.io

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`Message Service running on port ${PORT}`));