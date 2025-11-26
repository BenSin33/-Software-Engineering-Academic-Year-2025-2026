import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// ==================== HELPERS ====================
const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const getCurrentUserId = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

const getCurrentRoleId = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('roleId') : null;

const getAuthHeaders = () => {
  const token = getToken();
  if (!token) throw new Error('Token không tồn tại');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// ==================== ROLE-BASED SERVICE ====================
export const API = {
  getMyProfile: async () => {
    const roleId = getCurrentRoleId();
    const userId = getCurrentUserId();
    if (!roleId || !userId) throw new Error('Không tìm thấy thông tin đăng nhập');

    switch (roleId) {
      case 'R001': // Admin
        return (await axios.get(`${API_BASE_URL}/users/${userId}`, getAuthHeaders())).data;

      case 'R002': // Driver
        return (await axios.get(`${API_BASE_URL}/drivers/user/${userId}`, getAuthHeaders())).data;

      case 'R003': // Parent
        return (await axios.get(`${API_BASE_URL}/parents/user/${userId}`, getAuthHeaders())).data;

      default:
        throw new Error('Vai trò không hợp lệ');
    }
  },

  // Các API mà tài khoản hiện tại được phép thực hiện
  getResources: () => {
    const roleId = getCurrentRoleId();
    switch (roleId) {
      case 'R001': // Admin
        return {
          users: {
            list: () => axios.get(`${API_BASE_URL}/users`, getAuthHeaders()).then(r => r.data),
            get: (id: string) => axios.get(`${API_BASE_URL}/users/${id}`, getAuthHeaders()).then(r => r.data),
            create: (payload: any) => axios.post(`${API_BASE_URL}/users`, payload, getAuthHeaders()).then(r => r.data),
            update: (id: string, payload: any) => axios.put(`${API_BASE_URL}/users/${id}`, payload, getAuthHeaders()).then(r => r.data),
            delete: (id: string) => axios.delete(`${API_BASE_URL}/users/${id}`, getAuthHeaders()).then(r => r.data),
          },
          drivers: {
            list: () => axios.get(`${API_BASE_URL}/drivers`, getAuthHeaders()).then(r => r.data),
            get: (id: string) => axios.get(`${API_BASE_URL}/drivers/${id}`, getAuthHeaders()).then(r => r.data),
            create: (payload: any) => axios.post(`${API_BASE_URL}/drivers`, payload, getAuthHeaders()).then(r => r.data),
            update: (id: string, payload: any) => axios.put(`${API_BASE_URL}/drivers/${id}`, payload, getAuthHeaders()).then(r => r.data),
            delete: (id: string) => axios.delete(`${API_BASE_URL}/drivers/${id}`, getAuthHeaders()).then(r => r.data),
          },
          parents: {
            list: () => axios.get(`${API_BASE_URL}/parents`, getAuthHeaders()).then(r => r.data),
            get: (id: string) => axios.get(`${API_BASE_URL}/parents/${id}`, getAuthHeaders()).then(r => r.data),
            create: (payload: any) => axios.post(`${API_BASE_URL}/parents`, payload, getAuthHeaders()).then(r => r.data),
            update: (id: string, payload: any) => axios.put(`${API_BASE_URL}/parents/${id}`, payload, getAuthHeaders()).then(r => r.data),
            delete: (id: string) => axios.delete(`${API_BASE_URL}/parents/${id}`, getAuthHeaders()).then(r => r.data),
          },
        };

      case 'R002': // Driver
        return {
          driver: {
            getMyProfile: () => axios.get(`${API_BASE_URL}/drivers/user/${getCurrentUserId()}`, getAuthHeaders()).then(r => r.data),
            updateMyInfo: (payload: any) => axios.put(`${API_BASE_URL}/drivers/user/${getCurrentUserId()}`, payload, getAuthHeaders()).then(r => r.data),
          },
        };

      case 'R003': // Parent
        return {
          parent: {
            getMyProfile: () => axios.get(`${API_BASE_URL}/parents/user/${getCurrentUserId()}`, getAuthHeaders()).then(r => r.data),
            updateMyInfo: (payload: any) =>
              axios.put(`${API_BASE_URL}/parents/user/${getCurrentUserId()}`, payload, getAuthHeaders()).then(r => r.data),
          },
        };

      default:
        throw new Error('Vai trò không hợp lệ');
    }
  },
};
