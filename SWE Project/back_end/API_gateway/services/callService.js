const SERVICE_URLS = {
  student_service: "http://localhost:5001",
  parent_service: "http://localhost:5002", // ✅ thêm dòng này
};

export async function callService(serviceName, path, method = "GET", data = null) {
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
    throw new Error(`Lỗi khi gọi ${serviceName}: ${response.statusText}`);
  }

  return await response.json();
}