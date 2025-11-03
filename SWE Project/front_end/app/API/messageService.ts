// app/API/messageService.ts - FIXED VERSION

const API_URL = 'http://localhost:5000/api'; // 🔧 ĐÃ SỬA: Từ 3002 → 5000

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
}

export interface SendMessageData {
  senderId: number;
  receiverId: number;
  content: string;
}

/**
 * Lấy danh sách tin nhắn giữa 2 người
 */
export async function fetchMessages(
  senderId: number,
  receiverId: number
): Promise<Message[]> {
  try {
    console.log('📥 Fetching messages:', { senderId, receiverId });
    
    const response = await fetch(
      `${API_URL}/messages/${senderId}/${receiverId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(' Messages loaded:', result);

    // Xử lý cả trường hợp có result.data và không có
    if (result.success && result.data) {
      return Array.isArray(result.data) ? result.data : [];
    } else if (Array.isArray(result)) {
      return result;
    } else {
      return [];
    }
  } catch (error: any) {
    console.error(' Fetch messages error:', error);
    
    // Chi tiết hóa lỗi
    if (error.message?.includes('fetch failed') || error.message?.includes('ECONNREFUSED')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. API Gateway (port 5000)\n2. Messaging Service (port 5002)');
    }
    
    throw error;
  }
}

/**
 * Gửi tin nhắn mới
 */
export async function sendMessage(data: SendMessageData): Promise<Message> {
  try {
    console.log('📤 Sending message:', data);

    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Send response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(' Send error:', errorData);
      
      // Xử lý các loại lỗi cụ thể
      if (response.status === 503) {
        throw new Error('Messaging Service chưa khởi động. Vui lòng chạy:\ncd back_end\\Services\\messaging_service && npm start');
      } else if (response.status === 400) {
        throw new Error(errorData.message || 'Thiếu thông tin senderId, receiverId hoặc content');
      } else if (response.status === 500) {
        throw new Error(errorData.message || 'Lỗi server khi gửi tin nhắn');
      }
      
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log(' Message sent:', result);

    if (result.success && result.data) {
      return result.data;
    } else if (result.id) {
      return result;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error: any) {
    console.error(' Send message error:', error);
    
    // Chi tiết hóa lỗi
    if (error.message?.includes('fetch failed') || error.message?.includes('ECONNREFUSED')) {
      throw new Error('Không thể kết nối đến server. Đảm bảo:\n1. API Gateway đang chạy (port 5000)\n2. Messaging Service đang chạy (port 5002)\n3. Database đã được setup');
    }
    
    throw error;
  }
}

/**
 * Test connection đến messaging service
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/messages/1/1`);
    return response.ok || response.status === 404; // 404 cũng OK vì service đang chạy
  } catch {
    return false;
  }
}