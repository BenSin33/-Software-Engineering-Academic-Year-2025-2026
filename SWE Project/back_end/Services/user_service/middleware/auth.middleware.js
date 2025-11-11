// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (!allowedRoles.includes(decoded.roleID)) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (err) {
      return res.status(403).json({ error: "Token expired or invalid" });
    }
  };
};