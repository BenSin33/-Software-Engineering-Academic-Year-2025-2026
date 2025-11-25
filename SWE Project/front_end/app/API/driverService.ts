// app/API/driverService.ts

const API_URL = "http://localhost:5000/api/bus-drivers";
// Interface định nghĩa cấu trúc dữ liệu Driver từ backend
export interface DriverBackend {
  DriverID: number;
  UserID: number;
  Fullname: string;
  PhoneNumber: string;
  Email: string;
  Status: "active" | "rest";
  CreatedAt?: string;
  UpdatedAt?: string;
}

// Interface định nghĩa cấu trúc dữ liệu Driver cho frontend
export interface DriverFrontend {
  id: number;
  userId: number;
  name: string;
  phone: string;
  email: string;
  status: "active" | "rest";
  avatar: string;
  bus?: string;
  route?: string;
}

// Interface cho request tạo/cập nhật driver
export interface DriverCreateRequest {
  UserID: number;
  Fullname: string;
  PhoneNumber: string;
  Email: string;
  Status?: "active" | "rest";
}

export interface DriverUpdateRequest {
  Fullname?: string;
  PhoneNumber?: string;
  Email?: string;
  Status?: "active" | "rest";
}

// Interface cho response từ API
export interface DriverApiResponse {
  success: boolean;
  data?: DriverBackend | DriverBackend[];
  message?: string;
  total?: number;
}

// Interface cho thống kê driver
export interface DriverStats {
  total: number;
  active: number;
  rest: number;
}

// Hàm chuyển đổi từ backend format sang frontend format
export function mapDriverBackendToFrontend(driver: DriverBackend): DriverFrontend {
  return {
    id: driver.DriverID,
    userId: driver.UserID,
    name: driver.Fullname,
    phone: driver.PhoneNumber,
    email: driver.Email,
    status: driver.Status,
    avatar: driver.Fullname.charAt(0).toUpperCase(),
  };
}

// Hàm chuyển đổi từ frontend format sang backend format
export function mapDriverFrontendToBackend(driver: Partial<DriverFrontend>): Partial<DriverBackend> {
  const backendDriver: Partial<DriverBackend> = {};

  if (driver.id) backendDriver.DriverID = driver.id;
  if (driver.userId) backendDriver.UserID = driver.userId;
  if (driver.name) backendDriver.Fullname = driver.name;
  if (driver.phone) backendDriver.PhoneNumber = driver.phone;
  if (driver.email) backendDriver.Email = driver.email;
  if (driver.status) backendDriver.Status = driver.status;

  return backendDriver;
}

// ==================== API FUNCTIONS ====================

/**
 * Lấy danh sách tất cả tài xế
 * @param filters - Các bộ lọc (status, search, Fullname, PhoneNumber, Email)
 * @param pagination - Phân trang (limit, offset)
 * @returns Promise<DriverFrontend[]>
 */
export async function fetchAllDrivers(
  filters?: {
    status?: string;
    search?: string;
    Fullname?: string;
    PhoneNumber?: string;
    Email?: string;
  },
  pagination?: {
    limit?: number;
    offset?: number;
  }
): Promise<DriverFrontend[]> {
  try {
    const params = new URLSearchParams();

    // Thêm filters vào query params
    if (filters) {
      if (filters.status && filters.status !== 'all') params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.Fullname) params.append("Fullname", filters.Fullname);
      if (filters.PhoneNumber) params.append("PhoneNumber", filters.PhoneNumber);
      if (filters.Email) params.append("Email", filters.Email);
    }

    // Thêm pagination
    if (pagination) {
      params.append("limit", (pagination.limit || 100).toString());
      params.append("offset", (pagination.offset || 0).toString());
    } else {
      params.append("limit", "1000");
    }

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Không thể tải danh sách tài xế");
    }

    const result: DriverApiResponse = await response.json();

    if (result.success && Array.isArray(result.data)) {
      return result.data.map(mapDriverBackendToFrontend);
    }

    return [];
  } catch (error) {
    console.error("Lỗi fetchAllDrivers:", error);
    throw error;
  }
}

/**
 * Lấy thông tin chi tiết một tài xế theo ID
 * @param driverId - Mã tài xế (DriverID)
 * @returns Promise<DriverFrontend>
 */
export async function fetchDriverById(driverId: number): Promise<DriverFrontend> {
  try {
    const response = await fetch(`${API_URL}/${driverId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Không tìm thấy tài xế");
    }

    const result: DriverApiResponse = await response.json();

    if (result.success && result.data && !Array.isArray(result.data)) {
      return mapDriverBackendToFrontend(result.data);
    }

    throw new Error("Dữ liệu không hợp lệ");
  } catch (error) {
    console.error("Lỗi fetchDriverById:", error);
    throw error;
  }
}

/**
 * Lấy thông tin tài xế theo UserID
 * @param userId - ID người dùng từ user_service
 * @returns Promise<DriverFrontend>
 */
export async function fetchDriverByUserId(userId: number): Promise<DriverFrontend> {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Không tìm thấy tài xế với UserID này");
    }

    const result: DriverApiResponse = await response.json();

    if (result.success && result.data && !Array.isArray(result.data)) {
      return mapDriverBackendToFrontend(result.data);
    }

    throw new Error("Dữ liệu không hợp lệ");
  } catch (error) {
    console.error("Lỗi fetchDriverByUserId:", error);
    throw error;
  }
}

/**
 * Tạo tài xế mới
 * @param driverData - Dữ liệu tài xế cần tạo
 * @returns Promise<DriverApiResponse>
 */
export async function createDriver(driverData: DriverCreateRequest): Promise<DriverApiResponse> {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(driverData),
    });

    const result: DriverApiResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Lỗi khi thêm tài xế");
    }

    return result;
  } catch (error) {
    console.error("Lỗi createDriver:", error);
    throw error;
  }
}

/**
 * Cập nhật thông tin tài xế
 * @param driverId - Mã tài xế (DriverID)
 * @param updateData - Dữ liệu cần cập nhật
 * @returns Promise<DriverApiResponse>
 */
export async function updateDriver(
  driverId: number,
  updateData: DriverUpdateRequest
): Promise<DriverApiResponse> {
  try {
    const response = await fetch(`${API_URL}/${driverId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const result: DriverApiResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Lỗi khi cập nhật tài xế");
    }

    return result;
  } catch (error) {
    console.error("Lỗi updateDriver:", error);
    throw error;
  }
}

/**
 * Cập nhật trạng thái tài xế
 * @param driverId - Mã tài xế (DriverID)
 * @param status - Trạng thái mới ('active' hoặc 'rest')
 * @returns Promise<DriverApiResponse>
 */
export async function updateDriverStatus(
  driverId: number,
  status: "active" | "rest"
): Promise<DriverApiResponse> {
  try {
    const response = await fetch(`${API_URL}/${driverId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const result: DriverApiResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Lỗi khi cập nhật trạng thái");
    }

    return result;
  } catch (error) {
    console.error("Lỗi updateDriverStatus:", error);
    throw error;
  }
}

/**
 * Xóa tài xế
 * @param driverId - Mã tài xế (DriverID)
 * @returns Promise<DriverApiResponse>
 */
export async function deleteDriver(driverId: number): Promise<DriverApiResponse> {
  try {
    const response = await fetch(`${API_URL}/${driverId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result: DriverApiResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Lỗi khi xóa tài xế");
    }

    return result;
  } catch (error) {
    console.error("Lỗi deleteDriver:", error);
    throw error;
  }
}

/**
 * Lấy thống kê tài xế
 * @returns Promise với thông tin thống kê
 */
export async function fetchDriverStats(): Promise<DriverStats> {
  try {
    const response = await fetch(`${API_URL}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Không thể tải thống kê");
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    throw new Error("Dữ liệu không hợp lệ");
  } catch (error) {
    console.error("Lỗi fetchDriverStats:", error);
    throw error;
  }
}

/**
 * Kiểm tra kết nối với backend
 * @returns Promise<boolean>
 */
export async function checkBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:3002/health`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("Backend không phản hồi:", error);
    return false;
  }
}