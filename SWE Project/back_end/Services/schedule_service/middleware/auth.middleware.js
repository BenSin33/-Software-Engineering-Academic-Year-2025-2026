// Services/schedule_service/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

// Lấy secret key từ biến môi trường hoặc dùng cứng để test (phải khớp với bên Auth Service)
const JWT_SECRET = "aZ7xPqL9vT2mYhK8WcR1eJbXnDfUqMwLsCgVoRtEzBpNdQkGyH";

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    // Tách chữ 'Bearer ' ra khỏi chuỗi token
    const bearer = token.split(' ')[1]; 
    if (!bearer) return res.status(403).json({ message: 'Token format invalid' });

    const decoded = jwt.verify(bearer, JWT_SECRET);
    req.user = decoded; // Lưu thông tin user vào req để controller dùng
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid Token' });
  }
};

module.exports = { verifyToken };