'use client';

import MapView from '@/components/Layouts/MapView'; // Đường dẫn đúng tới MapView.tsx

export default function TrackingPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Tuyến đường từ TP.HCM đến Hà Nội 🛣️</h1>

      <div className="bg-white rounded-xl shadow-xl overflow-hidden p-2 mx-auto" style={{ maxWidth: 800 }}>
        <MapView />
        <div className="p-4 text-center text-sm text-gray-500">
          Dữ liệu tuyến đường được lấy từ OpenRouteService và hiển thị bằng MapTiler.
        </div>
      </div>
    </div>
  );
}