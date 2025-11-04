// app/API/parentService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3019';

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
  userId: string;
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

/**
 * Lấy tất cả phụ huynh
 */
export async function getAllParents(): Promise<Parent[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy danh sách phụ huynh');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error: any) {
    console.error(' Error fetching parents:', error);
    throw new Error(error.message || 'Lỗi khi lấy danh sách phụ huynh');
  }
}

/**
 * Lấy phụ huynh theo ParentID
 */
export async function getParentById(parentId: string): Promise<Parent> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parents/${parentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không tìm thấy phụ huynh');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    console.error(' Error fetching parent:', error);
    throw new Error(error.message || 'Lỗi khi lấy thông tin phụ huynh');
  }
}

/**
 * Lấy phụ huynh theo UserID
 */
export async function getParentByUserId(userId: string): Promise<Parent> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parents/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không tìm thấy phụ huynh');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    console.error(' Error fetching parent by userId:', error);
    throw new Error(error.message || 'Lỗi khi lấy thông tin phụ huynh');
  }
}

/**
 * Tạo phụ huynh mới
 */
export async function createParent(data: CreateParentDto): Promise<{ parentId: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo phụ huynh');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    console.error(' Error creating parent:', error);
    throw new Error(error.message || 'Lỗi khi tạo phụ huynh');
  }
}

/**
 * Cập nhật phụ huynh
 */
export async function updateParent(parentId: string, data: UpdateParentDto): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parents/${parentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể cập nhật phụ huynh');
    }
  } catch (error: any) {
    console.error(' Error updating parent:', error);
    throw new Error(error.message || 'Lỗi khi cập nhật phụ huynh');
  }
}

/**
 * Xóa phụ huynh
 */
export async function deleteParent(parentId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parents/${parentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể xóa phụ huynh');
    }
  } catch (error: any) {
    console.error(' Error deleting parent:', error);
    throw new Error(error.message || 'Lỗi khi xóa phụ huynh');
  }
}