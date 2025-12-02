// Dữ liệu danh sách chuyến đi (Cho trang Schedule & Modal chọn chuyến)
export const MOCK_TRIPS = [
  {
    id: 1,
    route_name: 'Tuyến A - Chuyến Sáng', // Lưu ý: Backend trả về route_name (snake_case) hoặc routeName tùy bạn quy ước
    routeName: 'Tuyến A - Chuyến Sáng',  // Để phòng hờ
    date: '2023-11-25',
    startTime: '06:30',
    endTime: '08:00',
    status: 'NOT_STARTED',
    startLat: 10.7629, 
    startLng: 106.6822,
    endLat: 10.7721,
    endLng: 106.6579
  },
  {
    id: 2,
    route_name: 'Tuyến A - Chuyến Chiều',
    routeName: 'Tuyến A - Chuyến Chiều',
    date: '2023-11-25',
    startTime: '16:30',
    endTime: '18:00',
    status: 'NOT_STARTED',
    startLat: 10.7721, 
    startLng: 106.6579,
    endLat: 10.7629,
    endLng: 106.6822
  },
  {
    id: 3,
    route_name: 'Tuyến B - Chuyến Sáng',
    routeName: 'Tuyến B - Chuyến Sáng',
    date: '2023-11-26',
    startTime: '06:00',
    endTime: '07:30',
    status: 'COMPLETED',
    startLat: 10.8, 
    startLng: 106.7,
    endLat: 10.9,
    endLng: 106.8
  }
];

// Hàm giả lập lấy chi tiết 1 chuyến
export const getMockTripById = (id) => {
  const trip = MOCK_TRIPS.find(t => t.id == id);
  return trip || MOCK_TRIPS[0]; // Nếu không thấy thì trả về cái đầu tiên
};