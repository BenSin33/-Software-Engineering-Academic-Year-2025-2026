// app/API/busService.ts

const API_URL = "http://localhost:5000/api";

// Interface định nghĩa cấu trúc dữ liệu Bus từ backend
export interface BusBackend {
  BusID: string;
  PlateNumber: string;
  Capacity: number;
  CurrentLoad: number;
  FuelLevel: number;
  Status: "running" | "waiting" | "maintenance" | "ready";
  Location: string | null;
  PickUpLocation: string | null;
  DropOffLocation: string | null;
  DriverID: number | null;
  RouteID: string | null;
  CreatedAt?: string;
  UpdatedAt?: string;
}

// Interface định nghĩa cấu trúc dữ liệu Bus cho frontend
export interface BusFrontend {
  id: string;
  license_plate: string;
  status: "running" | "waiting" | "maintenance" | "ready";
  capacity: number;
  current_load: number;
  fuel_level: number;
  driver_id: number | null; // thêm để liên kết chuẩn
  driver_name: string;
  route_id: string;
  location: string;
  PickUpLocation: string;
  DropOffLocation: string;
}

// Interface cho request tạo/cập nhật bus
export interface BusCreateRequest {
  BusID: string;
  PlateNumber: string;
  Capacity: number;
  CurrentLoad?: number;
  FuelLevel?: number;
  Status?: "running" | "waiting" | "maintenance" | "ready";
  Location?: string | null;
  PickUpLocation?: string | null;
  DropOffLocation?: string | null;
  DriverID?: number | null;
  RouteID?: string | null;
}

export interface BusUpdateRequest {
  PlateNumber?: string;
  Capacity?: number;
  CurrentLoad?: number;
  FuelLevel?: number;
  Status?: "running" | "waiting" | "maintenance" | "ready";
  Location?: string | null;
  PickUpLocation?: string | null;
  DropOffLocation?: string | null;
  DriverID?: number | null;
  RouteID?: string | null;
}

// Interface cho response từ API
export interface BusApiResponse {
  success: boolean;
  data?: BusBackend | BusBackend[];
  message?: string;
  total?: number;
}

// Hàm chuyển đổi từ backend format sang frontend format
export function mapBusBackendToFrontend(bus: BusBackend): BusFrontend {
  return {
    id: bus.BusID || "",
    license_plate: bus.PlateNumber || "",
    status: bus.Status || "ready",
    capacity: bus.Capacity || 0,
    current_load: bus.CurrentLoad || 0,
    fuel_level: bus.FuelLevel || 100,
    driver_id: bus.DriverID ?? null,   // mapping số driver
    driver_name: bus.DriverID ? `Driver ${bus.DriverID}` : "N/A",
    route_id: bus.RouteID || "N/A",
    location: bus.Location || "N/A",
    PickUpLocation: bus.PickUpLocation || "N/A",
    DropOffLocation: bus.DropOffLocation || "N/A",
  };
}

// Hàm chuyển đổi từ frontend format sang backend format
export function mapBusFrontendToBackend(bus: Partial<BusFrontend>): Partial<BusBackend> {
  const backendBus: Partial<BusBackend> = {};
  
  if (bus.id) backendBus.BusID = bus.id;
  if (bus.license_plate) backendBus.PlateNumber = bus.license_plate;
  if (bus.status) backendBus.Status = bus.status;
  if (bus.capacity !== undefined) backendBus.Capacity = bus.capacity;
  if (bus.current_load !== undefined) backendBus.CurrentLoad = bus.current_load;
  if (bus.fuel_level !== undefined) backendBus.FuelLevel = bus.fuel_level;
  if (bus.location) backendBus.Location = bus.location;
  if (bus.PickUpLocation) backendBus.PickUpLocation = bus.PickUpLocation;
  if (bus.DropOffLocation) backendBus.DropOffLocation = bus.DropOffLocation;
  if (bus.route_id && bus.route_id !== "N/A") backendBus.RouteID = bus.route_id;
  
  return backendBus;
}

// ==================== API FUNCTIONS ====================

/**
 * Lấy danh sách tất cả xe buýt
 * @param filters - Các bộ lọc (status, search, minCapacity, maxCapacity, minFuel, route)
 * @param pagination - Phân trang (limit, offset)
 * @returns Promise<BusFrontend[]>
 */
export async function fetchAllBuses(
  filters?: {
    status?: string;
    search?: string;
    minCapacity?: number;
    maxCapacity?: number;
    minFuel?: number;
    route?: string;
  },
  pagination?: {
    limit?: number;
    offset?: number;
  }
): Promise<BusFrontend[]> {
  try {
    const params = new URLSearchParams();
    
    // Thêm filters vào query params
    if (filters) {
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.minCapacity) params.append("minCapacity", filters.minCapacity.toString());
      if (filters.maxCapacity) params.append("maxCapacity", filters.maxCapacity.toString());
      if (filters.minFuel) params.append("minFuel", filters.minFuel.toString());
      if (filters.route) params.append("route", filters.route);
    }
    
    // Thêm pagination
    if (pagination) {
      params.append("limit", (pagination.limit || 1000).toString());
      params.append("offset", (pagination.offset || 0).toString());
    } else {
      params.append("limit", "1000");
    }

    const response = await fetch(`${API_URL}/buses?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Đường dẫn lấy được",`${API_URL}/buses?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Không thể tải danh sách xe");
    }

    const result: BusApiResponse = await response.json();
    
    if (result.success && Array.isArray(result.data)) {
      return result.data.map(mapBusBackendToFrontend);
    }
    
    return [];
  } catch (error) {
    console.error("Lỗi fetchAllBuses:", error);
    throw error;
  }
}

/**
 * Lấy thông tin chi tiết một xe theo ID
 * @param busId - Mã xe (BusID)
 * @returns Promise<BusFrontend>
 */
export async function fetchBusById(busId: string): Promise<BusFrontend> {
  try {
    const response = await fetch(`${API_URL}/buses/${busId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Không tìm thấy xe");
    }

    const result: BusApiResponse = await response.json();
    
    if (result.success && result.data && !Array.isArray(result.data)) {
      return mapBusBackendToFrontend(result.data);
    }
    
    throw new Error("Dữ liệu không hợp lệ");
  } catch (error) {
    console.error("Lỗi fetchBusById:", error);
    throw error;
  }
}

/**
 * Tạo xe mới
 * @param busData - Dữ liệu xe cần tạo
 * @returns Promise<BusApiResponse>
 */
export async function createBus(busData: BusCreateRequest): Promise<BusApiResponse> {
  try {
    const response = await fetch(`${API_URL}/buses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(busData),
    });

    const result: BusApiResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Lỗi khi thêm xe");
    }

    return result;
  } catch (error) {
    console.error("Lỗi createBus:", error);
    throw error;
  }
}

/**
 * Cập nhật thông tin xe
 * @param busId - Mã xe (BusID)
 * @param updateData - Dữ liệu cần cập nhật
 * @returns Promise<BusApiResponse>
 */
export async function updateBus(
  busId: string,
  updateData: BusUpdateRequest
): Promise<BusApiResponse> {
  try {
    const response = await fetch(`${API_URL}/buses/${busId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const result: BusApiResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Lỗi khi cập nhật xe");
    }

    return result;
  } catch (error) {
    console.error("Lỗi updateBus:", error);
    throw error;
  }
}

/**
 * Xóa xe
 * @param busId - Mã xe (BusID)
 * @returns Promise<BusApiResponse>
 */
export async function deleteBus(busId: string): Promise<BusApiResponse> {
  try {
    const response = await fetch(`${API_URL}/buses/${busId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result: BusApiResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Lỗi khi xóa xe");
    }

    return result;
  } catch (error) {
    console.error("Lỗi deleteBus:", error);
    throw error;
  }
}

/**
 * Lấy thống kê xe buýt
 * @returns Promise với thông tin thống kê
 */
export async function fetchBusStats(): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/buses/stats`, {
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
    console.error("Lỗi fetchBusStats:", error);
    throw error;
  }
}