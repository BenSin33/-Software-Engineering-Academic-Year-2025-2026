'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios'; 
import { AlertTriangle, MapPin, Navigation, User, Bus } from 'lucide-react';
import SelectTripModal from './SelectTripModal'; 
import ReportIncidentModal from '@/components/Driver/ReportIncidentModal'; // Đảm bảo đúng đường dẫn

// Import MapView (Dynamic)
const DynamicMapView = dynamic(() => import('@/components/Layouts/MapView'), { 
  ssr: false, 
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">Đang tải bản đồ...</div>
});

const GATEWAY_URL = 'http://localhost:5000';

export default function TrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlScheduleId = searchParams.get('tripId'); 

  // --- STATE ---
  const [scheduleInfo, setScheduleInfo] = useState<any>(null);
  const [tripStatus, setTripStatus] = useState<string>('NOT_STARTED');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableSchedules, setAvailableSchedules] = useState<any[]>([]);
  const [isReportPanelOpen, setIsReportPanelOpen] = useState(false);
  
  // Map State
  const [routePolyline, setRoutePolyline] = useState<{ lat: number, lng: number }[]>([]);
  const [mapPoints, setMapPoints] = useState<{ start?: any, end?: any, current?: any }>({});
  
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load thông tin chuyến đi
  useEffect(() => {
    if (urlScheduleId) {
      fetchScheduleDetails(urlScheduleId);
    }
    return () => stopTracking(); 
  }, [urlScheduleId]);

  // 2. Auto Tracking
  useEffect(() => {
    if (tripStatus === 'IN_PROGRESS' && urlScheduleId) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [tripStatus, urlScheduleId]);

  // --- API CALLS ---

  const fetchScheduleDetails = async (id: string | number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${GATEWAY_URL}/Schedules/driver/my-schedules`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      const list = res.data.data || res.data.schedules || []; 
      // Tìm chuyến đúng ID (Ép kiểu chuỗi để so sánh cho chắc)
      const found = list.find((s: any) => String(s.ScheduleID) === String(id));

      if (found) {
        setScheduleInfo(found);
        setTripStatus(found.Status || 'NOT_STARTED');
        
        // --- XỬ LÝ TỌA ĐỘ BẢN ĐỒ ---
        // 1. Nếu Backend trả về Lat/Lng sẵn thì dùng luôn
        let startCoords = found.StartLat && found.StartLng ? { lat: found.StartLat, lng: found.StartLng } : null;
        let endCoords = found.EndLat && found.EndLng ? { lat: found.EndLat, lng: found.EndLng } : null;

        // 2. Nếu chưa có, Geocode từ địa chỉ (StartLocation)
        if (!startCoords && found.StartLocation) {
            startCoords = await geocodeAddress(found.StartLocation);
        }
        if (!endCoords && found.EndLocation) {
            endCoords = await geocodeAddress(found.EndLocation);
        }

        // Fallback: Nếu không tìm thấy gì cả thì lấy tọa độ HCM mặc định
        if (!startCoords) startCoords = { lat: 10.7769, lng: 106.7009 }; 
        if (!endCoords) endCoords = { lat: 10.8000, lng: 106.6000 };

        setMapPoints({ start: startCoords, end: endCoords });

        // 3. Vẽ đường đi
        if (startCoords && endCoords) {
            fetchRoutePolyline(startCoords, endCoords);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin chuyến:", error);
    }
  };

  // Helper: Geocoding (Gọi API Google hoặc OpenStreetMap)
  const geocodeAddress = async (address: string) => {
      try {
          // Bạn có thể dùng API của Gateway nếu có, hoặc gọi trực tiếp Nominatim (Free)
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
          if (res.data && res.data.length > 0) {
              return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
          }
      } catch (e) { console.warn("Geocode error", e); }
      return null;
  };

  const fetchRoutePolyline = async (start: any, end: any) => {
      try {
        const startStr = `${start.lng},${start.lat}`;
        const endStr = `${end.lng},${end.lat}`;
        
        const mapRes = await axios.get(`${GATEWAY_URL}/Map/route`, {
            params: { start: startStr, end: endStr }
        });

        // 👇 ĐÃ SỬA: Kiểm tra kỹ từng lớp dữ liệu xem có tồn tại không
        const responseData = mapRes.data as any;

        if (responseData && responseData.success && responseData.data && Array.isArray(responseData.data.coordinates)) {
            const rawCoords = responseData.data.coordinates;
            
            // Map dữ liệu
            const formattedCoords = rawCoords.map((c: any) => ({ lat: c[1], lng: c[0] }));
            setRoutePolyline(formattedCoords);
        } else {
            console.warn("⚠️ API Map không trả về tọa độ đường đi:", responseData);
        }

      } catch (e) { 
          // Không log lỗi đỏ để tránh làm rối console, chỉ warn nhẹ
          console.warn("Không vẽ được đường (Có thể do lỗi API Key hoặc mạng)"); 
      }
  };

  // --- TRACKING LOGIC ---

  const startTracking = () => {
    if (trackingIntervalRef.current) return;
    console.log("📍 Tracking started...");
    sendCurrentLocation();
    trackingIntervalRef.current = setInterval(sendCurrentLocation, 10000);
  };

  const stopTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
      console.log("🛑 Tracking stopped.");
    }
  };

  const sendCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, speed } = position.coords;
        setMapPoints(prev => ({ ...prev, current: { lat: latitude, lng: longitude } })); // Update UI

        try {
          await axios.post(`${GATEWAY_URL}/Location/update/${urlScheduleId}`, {
             latitude, longitude, speed: speed || 0
          });
        } catch (err) { console.error("Lỗi gửi GPS"); }
      },
      (error) => console.error("Lỗi GPS:", error),
      { enableHighAccuracy: true }
    );
  };

  // --- UI HANDLERS ---

  const handleOpenSelectTrip = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${GATEWAY_URL}/Schedules/driver/my-schedules`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data.data || res.data.schedules || [];
      
      // Lọc chuyến chưa hoàn thành
      const validTrips = list.filter((t: any) => t.Status !== 'COMPLETED' && t.Status !== 'CANCELLED');
      
      setAvailableSchedules(validTrips);
      setIsModalOpen(true); 
    } catch (error) { alert("Lỗi tải danh sách chuyến."); }
  };

  const handleSelectTrip = async (selectedId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. GỌI API ĐỂ "BẮT ĐẦU CHUYẾN ĐI" (Auto Start)
      await axios.patch(`${GATEWAY_URL}/Schedules/status/${selectedId}`, 
        { status: 'IN_PROGRESS' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 2. Cập nhật giao diện
      setIsModalOpen(false);
      router.push(`/DriverDashboard/Tracking?tripId=${selectedId}`);
      
      // 3. Set trạng thái cục bộ để kích hoạt Tracking ngay lập tức
      setTripStatus('IN_PROGRESS'); 
      
      // 4. Load lại thông tin chi tiết
      fetchScheduleDetails(selectedId);
      
      alert("Đã bắt đầu chuyến đi! Hệ thống đang ghi nhận vị trí.");

    } catch (error) {
      console.error("Lỗi bắt đầu chuyến:", error);
      alert("Không thể bắt đầu chuyến đi. Vui lòng thử lại.");
    }
  };

  const handleEndTrip = async () => {
    // 1. Xác nhận
    if (!confirm("Xác nhận kết thúc chuyến đi này? Hành động này không thể hoàn tác.")) return;

    try {
      // 2. Dừng gửi GPS ngay lập tức
      stopTracking();

      const token = localStorage.getItem('token');
      
      // 3. GỌI API CẬP NHẬT TRẠNG THÁI -> COMPLETED
      // (Backend dùng chung API update status mà ta vừa viết)
      await axios.patch(`${GATEWAY_URL}/Schedules/status/${urlScheduleId}`, 
        { status: 'COMPLETED' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 4. Cập nhật UI và chuyển trang
      setTripStatus('COMPLETED');
      alert("🎉 Chuyến đi đã hoàn thành! Cảm ơn bác tài.");
      
      // Quay về trang danh sách
      router.push('/DriverDashboard/Schedule'); 

    } catch (error) {
      console.error("Lỗi kết thúc chuyến:", error);
      alert("Lỗi kết nối! Vui lòng thử lại.");
      
      // Nếu lỗi mạng, có thể cho phép force stop hoặc thử lại
      // stopTracking(); // Tùy chọn: Dừng tracking dù lỗi API để đỡ tốn pin
    }
  };

  return (
    <div className="p-4 h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
         <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-orange-500" /> 
                Giám sát hành trình
            </h1>
            <p className="text-xs text-gray-500 mt-1">
                {tripStatus === 'IN_PROGRESS' ? '🟢 Đang di chuyển' : '⚪ Chưa bắt đầu'}
            </p>
         </div>
         
         <div className="flex gap-2">
            {tripStatus !== 'IN_PROGRESS' ? (
                <button onClick={handleOpenSelectTrip} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <MapPin size={16} /> Chọn Chuyến
                </button>
            ) : (
                <button onClick={handleEndTrip} className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700">
                  Kết thúc
                </button>
            )}
         </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        
        {/* Map Area */}
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 relative overflow-hidden">
            <DynamicMapView 
                coordinates={routePolyline}
                startPoint={mapPoints.start}
                endPoint={mapPoints.end}
                currentPoint={mapPoints.current}
            />
            
            {/* Floating Info Box on Map */}
            {scheduleInfo && (
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur p-4 rounded-xl shadow-xl border border-gray-200 w-72 z-[1000]">
                    <h3 className="font-bold text-gray-800 mb-2 truncate" title={scheduleInfo.RouteName}>
                        {scheduleInfo.RouteName || `Tuyến #${scheduleInfo.RouteID}`}
                    </h3>
                    <div className="text-sm space-y-2">
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 shrink-0"></div>
                            <p className="text-gray-600 line-clamp-2">{scheduleInfo.StartLocation || "Điểm đón"}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0"></div>
                            <p className="text-gray-600 line-clamp-2">{scheduleInfo.EndLocation || "Điểm trả"}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Sidebar Info */}
        <div className="w-80 flex flex-col gap-4">
            {/* Driver Info Card */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Thông tin chuyến xe</h4>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Bus className="text-orange-600" size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{scheduleInfo?.BusID || "---"}</p>
                        <p className="text-xs text-gray-500">Biển số xe</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{scheduleInfo?.DriverName || "---"}</p>
                        <p className="text-xs text-gray-500">Tài xế</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 mt-auto">
                <button 
                    onClick={() => setIsReportPanelOpen(true)}
                    disabled={!scheduleInfo}
                    className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <AlertTriangle size={18} /> Báo cáo sự cố
                </button>
            </div>
        </div>

      </div>

      {/* Modals */}
      <SelectTripModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trips={availableSchedules}
        onSelect={handleSelectTrip}
      />

      <ReportIncidentModal 
        isOpen={isReportPanelOpen}
        onClose={() => setIsReportPanelOpen(false)}
        onSubmit={(data) => { console.log(data); setIsReportPanelOpen(false); alert("Đã gửi!"); }}
      />
    </div>
  );
}