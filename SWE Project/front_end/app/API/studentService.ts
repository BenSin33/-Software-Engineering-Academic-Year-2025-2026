import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/students';

// Helper nội bộ để lấy token trực tiếp
const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const getHeaders = () => {
  const token = getToken();
  if (!token) throw new Error('Token không tồn tại');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const studentService = {
  getAll: async () => {
    const url = `${BASE_URL}/`;
    console.log('[DEBUG] Gọi API getAll:', url);
    try {
      const res = await axios.get(url, getHeaders());
      console.log('[DEBUG] Phản hồi getAll:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('[ERROR] getAll thất bại:', err.response?.data || err.message);
      throw err;
    }
  },

  getPickUpPoint: async (routeID: string) => {
    const url = `${BASE_URL}/route/${routeID}/PickUpPoint`;
    console.log('[DEBUG] Gọi API getPickUpPoint:', url);
    try {
      const res = await axios.get(url, getHeaders());
      console.log('[DEBUG] Phản hồi getPickUpPoint:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('[ERROR] getPickUpPoint thất bại:', err.response?.data || err.message);
      throw err;
    }
  },

  add: async (payload: {
    FullName: string;
    ParentID: string;
    DateOfBirth: string;
    PickUpPoint: string;
    DropOffPoint: string;
    routeID: string;
  }) => {
    const url = `${BASE_URL}/add`;
    console.log('[DEBUG] Gọi API addStudent:', url, 'Payload:', payload);
    try {
      const res = await axios.post(url, payload, getHeaders());
      console.log('[DEBUG] Phản hồi addStudent:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('[ERROR] addStudent thất bại:', err.response?.data || err.message);
      throw err;
    }
  },

  update: async (studentID: string, payload: {
    FullName: string;
    ParentID: string;
    DateOfBirth: string;
    PickUpPoint: string;
    DropOffPoint: string;
    routeID: string;
  }) => {
    const url = `${BASE_URL}/edit/${studentID}`;
    console.log('[DEBUG] Gọi API updateStudent:', url, 'Payload:', payload);
    try {
      const res = await axios.post(url, payload, getHeaders());
      console.log('[DEBUG] Phản hồi updateStudent:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('[ERROR] updateStudent thất bại:', err.response?.data || err.message);
      throw err;
    }
  },

  delete: async (studentID: string) => {
    const url = `${BASE_URL}/delete/${studentID}`;
    console.log('[DEBUG] Gọi API deleteStudent:', url);
    try {
      const res = await axios.post(url, {}, getHeaders());
      console.log('[DEBUG] Phản hồi deleteStudent:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('[ERROR] deleteStudent thất bại:', err.response?.data || err.message);
      throw err;
    }
  },

  getByParentID: async (parentID: string) => {
    const url = `${BASE_URL}/by-parent/${parentID}`;
    console.log('[DEBUG] Gọi API getStudentsByParentID:', url);
    try {
      const res = await axios.get(url, getHeaders());
      console.log('[DEBUG] Phản hồi getStudentsByParentID:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('[ERROR] getStudentsByParentID thất bại:', err.response?.data || err.message);
      throw err;
    }
  },
};