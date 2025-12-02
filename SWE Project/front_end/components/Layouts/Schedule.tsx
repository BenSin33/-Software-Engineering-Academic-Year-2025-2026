'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // 👈 1. Import Router để chuyển trang

// Định nghĩa kiểu dữ liệu
interface ScheduleItem {
  ScheduleID: number | string;
  RouteName: string;
  PlateNumber: string; 
  Date: string;        
  TimeStart: string;   
  TimeEnd: string;     
  Status: string;      
}

const GATEWAY_URL = 'http://localhost:5000'; // URL Gateway

// Component hiển thị trạng thái
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    'NOT_STARTED': { label: 'Chưa bắt đầu', color: 'bg-gray-100 text-gray-700' },
    'IN_PROGRESS': { label: 'Đang chạy', color: 'bg-yellow-100 text-yellow-800' },
    'COMPLETED': { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
    'default': { label: status, color: 'bg-blue-100 text-blue-700' }
  };
  const config = statusMap[status] || statusMap['default'];
  return (
    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function SchedulePage() {
  const router = useRouter(); // 👈 2. Khởi tạo Router
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Bạn chưa đăng nhập");
        setLoading(false);
        return;
      }
      const response = await axios.get(`${GATEWAY_URL}/Schedules/driver/my-schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataList = response.data.data || response.data.schedules || [];
      setSchedules(dataList);
    } catch (err) {
      console.error("Lỗi tải lịch:", err);
      setError("Không thể tải lịch trình.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // 👇 3. HÀM XỬ LÝ KHI BẤM "BẮT ĐẦU CHẠY"
  const handleStartTrip = async (scheduleID: number | string) => {
    try {
        const token = localStorage.getItem('token');
        
        // Bước A: Gọi API cập nhật trạng thái sang IN_PROGRESS
        await axios.patch(`${GATEWAY_URL}/Schedules/status/${scheduleID}`, 
            { status: 'IN_PROGRESS' }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Bước B: Chuyển hướng sang trang Tracking
        // Trang Tracking sẽ đọc tripId và thấy status IN_PROGRESS -> Tự động bật GPS
        router.push(`/DriverDashboard/Tracking?tripId=${scheduleID}`);

    } catch (error) {
        console.error("Lỗi bắt đầu chuyến:", error);
        alert("Không thể bắt đầu chuyến đi. Vui lòng kiểm tra kết nối.");
    }
  };

  // Hàm điều hướng khi bấm "Hoàn thành" (để xem lại hoặc kết thúc nốt)
  const handleViewTracking = (scheduleID: number | string) => {
      router.push(`/DriverDashboard/Tracking?tripId=${scheduleID}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
  };

  const formatTime = (timeString: string) => {
    return timeString?.substring(0, 5) || "--:--";
  };

  if (loading) return <div className="p-8 text-center">⏳ Đang tải lịch trình...</div>;
  if (error) return <div className="p-8 text-center text-red-500">❌ {error}</div>;

  return (
    <div className="p-4 md:p-8 h-full w-full bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex justify-between items-center">
          <span>📅 Lịch Chạy Xe</span>
          <button onClick={fetchSchedules} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            Làm mới
          </button>
        </h1>

        <div className="space-y-4">
          {schedules.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
              Bạn chưa có lịch chạy nào sắp tới.
            </div>
          ) : (
            schedules.map((trip) => (
              <div 
                key={trip.ScheduleID} 
                className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                        {formatDate(trip.Date)}
                      </p>
                      <h3 className="text-lg font-bold text-gray-800 mt-1">
                        {trip.RouteName || `Tuyến #${trip.RouteID}`}
                      </h3>
                    </div>
                    <StatusBadge status={trip.Status || 'NOT_STARTED'} />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center text-gray-600 gap-y-2 gap-x-6 mb-4">
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-blue-600 mr-2">
                        {formatTime(trip.TimeStart)}
                      </span>
                      <span className="text-sm text-gray-400 mx-2">➔</span>
                      <span className="text-sm font-medium">
                        {formatTime(trip.TimeEnd)}
                      </span>
                    </div>
                    
                    {trip.PlateNumber && (
                      <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                        <span className="text-xs text-gray-500 mr-1">Xe:</span>
                        <span className="font-mono font-bold text-gray-800">{trip.PlateNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Khu vực nút bấm hành động */}
                  <div className="border-t pt-3 flex gap-3">
                    
                    {/* 👇 4. NÚT BẮT ĐẦU CHẠY */}
                    {(!trip.Status || trip.Status === 'NOT_STARTED') && (
                       <button 
                         onClick={() => handleStartTrip(trip.ScheduleID)}
                         className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium text-sm transition-colors flex items-center justify-center gap-2"
                       >
                         ▶ Bắt đầu chạy
                       </button>
                    )}
                    
                    {/* 👇 5. NÚT ĐANG CHẠY (Chuyển sang Tracking để xem/kết thúc) */}
                    {trip.Status === 'IN_PROGRESS' && (
                       <button 
                         onClick={() => handleViewTracking(trip.ScheduleID)}
                         className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded font-medium text-sm transition-colors flex items-center justify-center gap-2"
                       >
                         📍 Tiếp tục hành trình
                       </button>
                    )}

                    {trip.Status === 'COMPLETED' && (
                      <button disabled className="flex-1 bg-gray-200 text-gray-400 py-2 rounded font-medium text-sm cursor-not-allowed">
                        Đã hoàn thành
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}