// app/API/parentService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Parent {
  ParentID: string;
  UserID: string;
  TrackingID?: string;
  FullName: string;
  PhoneNumber: string;
  Email: string;
  Address?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface CreateParentDto {
  userId?: string;  // Optional - backend creates this automatically
  trackingId?: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address?: string;
}

export interface UpdateParentDto {
  trackingId?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

// ==================== HELPERS ====================
const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const getAuthHeaders = () => {
  const token = getToken();
  if (!token) throw new Error('Token không tồn tại');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// ==================== API FUNCTIONS ====================

/**
 * Lấy tất cả phụ huynh
 */
export async function getAllParents(): Promise<Parent[]> {
  const url = `${API_BASE_URL}/api/parents`;
  console.log("👉 Fetching all parents:", url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log("👉 Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Server error body:", text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log("👉 Parsed JSON result:", result);
    return result.data || [];
  } catch (error: any) {
    console.error('❌ Error fetching parents:', error);
    throw new Error(error.message || 'Lỗi khi lấy danh sách phụ huynh');
  }
}

/**
 * Lấy phụ huynh theo ParentID
 */
export async function getParentById(parentId: string): Promise<Parent> {
  const url = `${API_BASE_URL}/api/parents/${parentId}`;
  console.log("👉 Fetching parent by ParentID:", url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log("👉 Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Server error body:", text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log("👉 Parsed JSON result:", result);
    return result.data;
  } catch (error: any) {
    console.error('❌ Error fetching parent:', error);
    throw new Error(error.message || 'Lỗi khi lấy thông tin phụ huynh');
  }
}

/**
 * Lấy phụ huynh theo UserID
 */
export async function getParentByUserId(userId: string): Promise<Parent> {
  const url = `${API_BASE_URL}/api/parents/user/${userId}`;
  console.log("👉 Fetching parent by UserID:", url);
  logAuthInfo()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log("👉 Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Server error body:", text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log("👉 Parsed JSON result:", result);
    return result.data;
  } catch (error: any) {
    console.error('❌ Error fetching parent by userId:', error);
    throw new Error(error.message || 'Lỗi khi lấy thông tin phụ huynh');
  }
}

/**
 * Tạo phụ huynh mới
 */
export async function createParent(data: CreateParentDto): Promise<{ parentId: string }> {
  const url = `${API_BASE_URL}/api/parents`;
  console.log("👉 Creating parent:", url, data);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    console.log("👉 Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Server error body:", text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log("👉 Parsed JSON result:", result);
    return result.data;
  } catch (error: any) {
    console.error('❌ Error creating parent:', error);
    throw new Error(error.message || 'Lỗi khi tạo phụ huynh');
  }
}

/**
 * Cập nhật phụ huynh
 */
export async function updateParent(parentId: string, data: UpdateParentDto): Promise<void> {
  const url = `${API_BASE_URL}/api/parents/${parentId}`;
  console.log("👉 Updating parent:", url, data);

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    console.log("👉 Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Server error body:", text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
  } catch (error: any) {
    console.error('❌ Error updating parent:', error);
    throw new Error(error.message || 'Lỗi khi cập nhật phụ huynh');
  }
}

/**
 * Xóa phụ huynh
 */
export async function deleteParent(parentId: string): Promise<void> {
  const url = `${API_BASE_URL}/api/parents/${parentId}`;
  console.log("👉 Deleting parent:", url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    console.log("👉 Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Server error body:", text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
  } catch (error: any) {
    console.error('❌ Error deleting parent:', error);
    throw new Error(error.message || 'Lỗi khi xóa phụ huynh');
  }
}

/**
 * Tìm kiếm học sinh theo tên
 */
export async function searchStudents(name: string): Promise<any[]> {
  const url = `${API_BASE_URL}/api/students/search?name=${encodeURIComponent(name)}`;
  console.log("👉 Searching students:", url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log("👉 Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Server error body:", text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log("👉 Parsed JSON result:", result);
    return result.students || [];
  } catch (error: any) {
    console.error('❌ Error searching students:', error);
    return [];
  }
}

/**
 * Gán học sinh cho phụ huynh
 */
export async function assignStudentToParent(studentId: number, parentId: string): Promise<void> {
  const url = `${API_BASE_URL}/api/students/update-parent/${studentId}`;
  console.log("👉 Assigning student to parent:", url, parentId);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ parentID: parentId }),
    });

    console.log("👉 Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Server error body:", text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
  } catch (error: any) {
    console.error('❌ Error assigning student to parent:', error);
    throw error;
  }
}

// ==================== DEBUG HELPERS ====================

export function logAuthInfo(): void {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const roleId = typeof window !== 'undefined' ? localStorage.getItem('roleId') : null;
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  console.log("🔑 Current token:", token);
  console.log("👤 Current roleId:", roleId);
  console.log("🆔 Current userId:", userId);

  if (!token) {
    console.warn("⚠️ Token không tồn tại trong localStorage");
  }
  if (!roleId) {
    console.warn("⚠️ RoleID không tồn tại trong localStorage");
  }
  if (!userId) {
    console.warn("⚠️ UserID không tồn tại trong localStorage");
  }
}

