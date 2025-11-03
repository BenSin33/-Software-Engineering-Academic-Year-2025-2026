const SERVICE_URLS = {
  student_service: "http://localhost:5001",
  parent_service: "http://localhost:5002",
  messaging_service: "http://localhost:5002",
  route_service: "http://localhost:5003",
  driver_service: "http://localhost:5004",
  location_service: "http://localhost:5010"
};

async function callService(serviceName, path, method = "GET", data = null) {
  const url = `${SERVICE_URLS[serviceName]}${path}`;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Chỉ thêm body nếu có dữ liệu (POST, PUT,...)
  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  // Kiểm tra response
  if (!response.ok) {
    // Thử lấy error message chi tiết từ response
    let errorMessage = `Lỗi khi gọi ${serviceName}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Nếu không parse được JSON, dùng statusText
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  return await response.json()
}

module.exports = { callService };