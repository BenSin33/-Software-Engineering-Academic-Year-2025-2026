const SERVICE_URLS = {
  user_service: "http://user_service:5012",
  bus_service: "http://bus_service:5011",
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
  
  // --- BẮT ĐẦU DEBUG: LOG TRƯỚC KHI GỌI FETCH ---
  console.log(`[GW DEBUG] Gọi dịch vụ ${serviceName}: ${url}`);
  // ------------------------------------------------

  const response = await fetch(url, options);

  // --- DEBUG 1: LOG STATUS VÀ CLONE RESPONSE ---
  console.log(`[GW DEBUG] Phản hồi Status từ ${serviceName}: ${response.status}`);
  
  // Clone response để có thể đọc body cho debug mà không làm hỏng response gốc
  const debugResponse = response.clone();
  // -----------------------------------------------

  // Kiểm tra response
  if (!response.ok) {
    // Xử lý lỗi HTTP status code (4xx, 5xx)
    let errorMessage = `Lỗi khi gọi ${serviceName}: ${response.statusText}`;
    try {
      const errorData = await debugResponse.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      const text = await debugResponse.text();
      errorMessage = `Phản hồi lỗi không phải JSON: ${text.substring(0, 50)}...`;
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  
  // Parse JSON
  let responseData;
  try {
    responseData = await response.json();
  } catch (parseError) {
    // Nếu JSON parsing thất bại, hãy đọc body dưới dạng text để tìm nguyên nhân
    const rawText = await debugResponse.text();
    console.error(`[GW DEBUG] LỖI PARSE JSON: Body nhận được không hợp lệ.`, rawText);
    throw new Error(`Phản hồi từ ${serviceName} không phải là JSON hợp lệ.`);
  }
  
  // --- DEBUG 2: LOG DỮ LIỆU ĐÃ PARSE THÀNH CÔNG ---
  console.log(`[GW DEBUG] Parsed JSON từ ${serviceName}:`, JSON.stringify(responseData, null, 2));
  // ------------------------------------------------

  return responseData
}

module.exports = { callService };