const express = require('express');
const cors = require('cors');
const app = express();
const messageRouter = require('./routes/messageRouter');

app.use(cors());
app.use(express.json());

app.use('/messages', messageRouter);

// SỬA DÒNG NÀY: Đổi từ "export default app" thành:
module.exports = app;