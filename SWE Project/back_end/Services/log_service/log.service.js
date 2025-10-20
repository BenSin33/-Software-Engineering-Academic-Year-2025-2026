const db = require('./db');

exports.createLog = (req, res) => {
  const { serviceName, action, userID, role, statusCode, message } = req.body;

  const sql = `INSERT INTO logs (ServiceName, Action, UserID, Role, StatusCode, Message) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [serviceName, action, userID, role, statusCode, message], (err) => {
    if (err) {
      console.error('Ghi log thất bại:', err.message);
      return res.status(500).json({ error: 'Ghi log thất bại' });
    }
    res.json({ message: 'Ghi log thành công' });
  });
};