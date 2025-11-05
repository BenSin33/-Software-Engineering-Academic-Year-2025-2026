const success = (res, data = null, message = 'Thành công', status = 200) => {
  res.status(status).json({ success: true, message, data });
};

const error = (res, message = 'Lỗi server', status = 500) => {
  res.status(status).json({ success: false, message });
};

module.exports = { success, error };