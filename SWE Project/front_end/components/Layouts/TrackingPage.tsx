// File: app/DriverDashboard/Tracking/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import { callService } from '../../utils/callService'; // ⚠️ Kiểm tra đường dẫn
import { AlertTriangle } from 'lucide-react';
import SelectTripModal from './SelectTripModal'; 
import ReportIncidentModal from '../Driver/ReportIncidentModal';

// Import MapView (Dynamic) để tránh lỗi SSR
const DynamicMapView = dynamic(() => import('@/components/Layouts/MapView'), { 
  ssr: false, 
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
      Đang tải bản đồ...
    </div>
  ) 
});

export default function TrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTripId = searchParams.get('tripId');

  // --- STATE ---
  const [tripInfo, setTripInfo] = useState<any>(null);
  const [tripStatus, setTripStatus] = useState<string>('NOT_STARTED');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [isReportPanelOpen, setIsReportPanelOpen] = useState(false);
  // State lưu tọa độ bản đồ (Lấy từ DB)
  const [mapCoords, setMapCoords] = useState<{ start: [number, number], end: [number, number] } | null>(null);

  // 1. Khi vào trang, nếu có ID trên URL thì tải thông tin ngay
  useEffect(() => {
    if (urlTripId) {
      fetchTripDetails(urlTripId);
    }
  }, [urlTripId]);

  const fetchTripDetails = async (id: string | number) => {
    try {
      // Gọi API lấy chi tiết chuyến
      const data = await callService('trip_service', `/api/trips/${id}`, 'GET');
      setTripInfo(data);
      setTripStatus(data.status);

      // ✅ CẬP NHẬT: Lấy tọa độ thật từ API trả về để vẽ bản đồ
        if (data && data.start_lat && data.start_lng) { 
          setMapCoords({
              // Ép kiểu Number để đảm bảo an toàn
              start: [Number(data.start_lat), Number(data.start_lng)], 
              end: [Number(data.end_lat), Number(data.end_lng)]    
          });
        } else {
        // Fallback: Nếu chưa có tọa độ, dùng mặc định (HCM)
        setMapCoords({
            start: [10.762622, 106.660172], 
            end: [10.800000, 106.700000] 
        });
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin chuyến:", error);
    }
  };

  // 2. Mở Modal chọn chuyến (Khi bấm nút "Bắt đầu chuyến mới")
  const handleOpenSelectTrip = async () => {
    try {
      const driverId = 'driver1'; 
      const trips = await callService('trip_service', `/api/trips/driver/${driverId}`, 'GET');
      
      // Chỉ lấy những chuyến chưa chạy
      const pendingTrips = Array.isArray(trips) 
        ? trips.filter((t: any) => t.status === 'NOT_STARTED') 
        : [];
      
      setAvailableTrips(pendingTrips);
      setIsModalOpen(true); 
    } catch (error) {
      alert("Lỗi tải danh sách chuyến đi.");
    }
  };

  // 3. Xử lý khi chọn chuyến từ Modal
  const handleSelectTrip = async (selectedTripId: number) => {
    try {
      await callService('trip_service', `/api/trips/${selectedTripId}/status`, 'PUT', { status: 'IN_PROGRESS' });
      setIsModalOpen(false);
      router.push(`/DriverDashboard/Tracking?tripId=${selectedTripId}`);
      fetchTripDetails(selectedTripId);
      alert("Bắt đầu chuyến thành công!");
    } catch (error) {
      alert("Lỗi xử lý bắt đầu chuyến.");
    }
  };

  // 4. Kết thúc chuyến
  const handleEndTrip = async () => {
    if (!tripInfo?.id) return;
    if (!confirm("Xác nhận kết thúc chuyến đi này?")) return;

    try {
      await callService('trip_service', `/api/trips/${tripInfo.id}/status`, 'PUT', { status: 'COMPLETED' });
      alert("Chuyến đi đã kết thúc!");
      router.push('/DriverDashboard/Schedule'); // Quay về trang lịch trình
    } catch (error) {
      alert("Lỗi kết thúc chuyến.");
    }
  };

  const handleReportSubmit = async (reportData: any) => {
    console.log("Gửi báo cáo:", reportData);
    try {
      // Ví dụ gọi API gửi báo cáo
      // await callService('trip_service', '/api/incidents', 'POST', { ...reportData, tripId: tripInfo?.id });
      alert("Đã gửi báo cáo sự cố thành công!");
    } catch (error) {
      alert("Lỗi khi gửi báo cáo.");
    }
  };

  

  return (
    <div className="p-6 md:p-8 h-full w-full bg-gray-50 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Theo dõi hành trình</h1>
         <div className="flex items-center gap-4">
            {/* Nút Bắt đầu (Hiện khi chưa có chuyến hoặc chuyến đã xong) */}
            {(!tripInfo || tripStatus === 'NOT_STARTED' || tripStatus === 'COMPLETED') && (
                <button 
                  onClick={handleOpenSelectTrip} 
                  className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-sm hover:bg-yellow-600 transition"
                >
                  Bắt đầu chuyến mới
                </button>
            )}

            {/* Nút Kết thúc (Hiện khi đang chạy) */}
            {tripStatus === 'IN_PROGRESS' && (
                <button 
                  onClick={handleEndTrip} 
                  className="px-4 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  Kết thúc chuyến
                </button>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: BẢN ĐỒ */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md h-full min-h-[500px]">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Bản đồ tuyến đường</h2>
            <div className="h-[450px] w-full rounded-md overflow-hidden border border-gray-200 relative z-0">
                {/* Truyền tọa độ vào MapView */}
                <DynamicMapView 
                    startPoint={mapCoords?.start || null} 
                    endPoint={mapCoords?.end || null} 
                />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Thông tin chuyến</h2>
            
            {tripInfo ? (
               <div className="space-y-4 animate-in fade-in duration-500">
                 <div className="p-3 bg-blue-50 rounded border border-blue-100">
                    <p className="text-xs text-blue-500 uppercase font-bold">Tuyến đường</p>
                    <p className="font-bold text-gray-800 text-lg">{tripInfo.routeName || tripInfo.route_name}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Giờ chạy</p>
                        <p className="font-semibold">
                            {tripInfo.startTime?.slice(0,5)} - {tripInfo.endTime?.slice(0,5)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Trạng thái</p>
                        <p className={`font-bold ${tripStatus === 'IN_PROGRESS' ? 'text-green-600' : 'text-gray-600'}`}>
                            {tripStatus === 'IN_PROGRESS' ? 'Đang chạy' : 
                             tripStatus === 'COMPLETED' ? 'Hoàn thành' : 'Chưa chạy'}
                        </p>
                    </div>
                 </div>
               </div>
            ) : (
              <div className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-300">
                Chưa chọn chuyến nào.
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
             <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-700">Cảnh báo</h2>
            </div>
            <button 
            onClick={() => setIsReportPanelOpen(true)}
            className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700">
              Báo cáo sự cố
            </button>
          </div>
        </div>
      </div>

      {/* Modal Chọn Chuyến */}
      <SelectTripModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trips={availableTrips}
        onSelect={handleSelectTrip}
      />

      <ReportIncidentModal 
        isOpen={isReportPanelOpen}
        onClose={() => setIsReportPanelOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}