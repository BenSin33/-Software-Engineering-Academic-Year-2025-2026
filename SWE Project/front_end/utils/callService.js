// File: src/utils/callService.js

// 1. Cấu hình địa chỉ API (Dùng localhost vì trình duyệt chạy trên máy của bạn)
const SERVICE_URLS = {
  // Service bạn đang làm
  schedule_service: "http://localhost:5005", 
  
  // Các service khác
  auth_service: "http://localhost:5010",
  student_service: "http://localhost:5001",
  user_service: "http://localhost:5012", 
  messaging_service: "http://localhost:5002",
  route_service: "http://localhost:5003",
  location_service: "http://localhost:5009"
};

/**
 * Hàm gọi API dùng chung cho Frontend
 * @param {string} serviceName Tên service (khớp với key trong SERVICE_URLS)
 * @param {string} path Đường dẫn API (ví dụ: '/Schedules')
 * @param {string} method GET, POST, PUT, DELETE (mặc định là GET)
 * @param {any} body Dữ liệu gửi đi (nếu có)
 */
export const callService = async (serviceName, path, method = 'GET', body = null) => {
  // 1. Lấy URL gốc
  const baseURL = SERVICE_URLS[serviceName];

  // Nếu gõ sai tên service, báo lỗi ngay để dễ debug
  if (!baseURL) {
    console.error(`❌ [Frontend] Không tìm thấy URL cho service: "${serviceName}". Hãy kiểm tra file utils/callService.js`);
    throw new Error(`Service ${serviceName} not defined`);
  }

  // 2. Ghép URL hoàn chỉnh
  const url = `${baseURL}${path}`;

  // 3. Cấu hình fetch options
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      // Nếu có Token đăng nhập, bạn có thể thêm vào đây:
      // "Authorization": `Bearer ${localStorage.getItem('token')}`
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  // 4. Thực hiện gọi API
  try {
    const response = await fetch(url, options);

    // Xử lý khi API trả về lỗi (4xx, 5xx)
    if (!response.ok) {
        // Thử lấy nội dung lỗi dưới dạng JSON, nếu không được thì lấy object rỗng
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi API (${response.status}): ${response.statusText}`);
    }

    // Trả về dữ liệu JSON
    return await response.json();
    
  } catch (error) {
    console.error(`🔥 Lỗi khi gọi ${serviceName}:`, error);
    throw error; // Ném lỗi tiếp để component (Schedule.tsx) catch được
  }
};