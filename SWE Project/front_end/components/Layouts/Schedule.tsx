// File: components/Layouts/Schedule.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { callService } from '../../utils/callService';

interface Trip {
  id: number;
  routeName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'COMPLETED') {
    return <span className="inline-block px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md">Hoàn thành</span>;
  }
  if (status === 'IN_PROGRESS') {
    return <span className="inline-block px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-md">Đang thực hiện</span>;
  }
  return <span className="inline-block px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Chưa bắt đầu</span>;
};

export default function SchedulePage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // 1️⃣ Lấy ID thật từ localStorage (thay vì fix cứng)
        // Giả sử khi login bạn lưu object user vào localStorage
        // const userStr = localStorage.getItem('user');
        // const user = userStr ? JSON.parse(userStr) : null;
        // const driverId = user?.id; 
        
        // Tạm thời để biến này test, bạn nhớ thay bằng logic lấy ID thật ở trên
        const driverId = 1; 

        if (!driverId) {
          console.error("Không tìm thấy ID tài xế");
          return;
        }

        // 2️⃣ Gọi đúng đường dẫn Backend quy định: /Schedules/driver/...
        // Lưu ý: 'schedule_service' phải khớp với tên bạn khai báo trong API Gateway (nếu có)
        const rawData = await callService('schedule_service', `/api/Schedules/driver/${driverId}`, 'GET');
        
        // 3️⃣ Ánh xạ dữ liệu (Mapping)
        // Backend trả về: ScheduleID, RouteID, TimeStart...
        // Frontend cần: id, routeName, startTime...
        const mappedData = Array.isArray(rawData) ? rawData.map((item: any) => ({
          id: item.ScheduleID || item.id,
          // Nếu backend chưa JOIN bảng Routes để lấy tên, nó sẽ hiện "Tuyến số [ID]"
          routeName: item.routeName || `Tuyến số ${item.RouteID}`, 
          date: item.Date,
          startTime: item.TimeStart,
          endTime: item.TimeEnd,
          status: item.status
        })) : [];

        // Sắp xếp
        const sortedData = mappedData.sort((a: Trip, b: Trip) => b.id - a.id);
        setTrips(sortedData);

      } catch (error) {
        console.error("Lỗi tải lịch trình:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <div className="p-6 md:p-8 h-full w-full bg-white">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Lịch trình làm việc
      </h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 p-6 border-b border-gray-200 bg-gray-50">
          Danh sách chuyến đi
        </h2>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : trips.length === 0 ? (
            <div className="p-8 text-center text-gray-500 italic">
              Bạn chưa có lịch trình nào.
            </div>
          ) : (
            <div className="min-w-full">
              <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50 font-semibold text-sm text-gray-500 uppercase border-b border-gray-100">
                <div>Ngày</div>
                <div>Tuyến đường</div>
                <div>Giờ chạy</div>
                <div>Trạng thái</div>
                <div className="text-center">Thao tác</div>
              </div>

              <div className="divide-y divide-gray-100">
                {trips.map((trip) => (
                  <div key={trip.id} className="grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-blue-50 transition">
                    <div className="text-gray-800 font-medium">
                      {/* Xử lý hiển thị ngày tháng an toàn hơn */}
                      {trip.date ? new Date(trip.date).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                    
                    <div className="text-gray-600 font-medium">{trip.routeName}</div>
                    
                    <div className="text-gray-600">
                      {/* Cắt chuỗi giờ cẩn thận nếu dữ liệu backend trả về có giây */}
                      {trip.startTime?.toString().slice(0, 5)} - {trip.endTime?.toString().slice(0, 5)}
                    </div>
                    
                    <div><StatusBadge status={trip.status} /></div>

                    <div className="text-center">
                      <button
                        onClick={() => router.push(`/DriverDashboard/Tracking?tripId=${trip.id}`)}
                        className={`text-sm font-bold px-4 py-2 rounded shadow-sm transition ${
                          trip.status === 'NOT_STARTED' 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {trip.status === 'NOT_STARTED' ? 'Bắt đầu' : 'Chi tiết'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}