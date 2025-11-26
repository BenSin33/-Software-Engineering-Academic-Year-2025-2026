const SERVICE_URLS = {
  auth_service: "http://auth_service:5010",
  student_service: "http://student_service:5001",
  parent_service: "http://user_service:5012",
  messaging_service: "http://messaging_service:5002",
  route_service: "http://route_service:5003",
  driver_service: "http://user_service:5012",
  schedule_service: "http://schedule_service:5005",
  location_service: "http://location_service:5009"
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