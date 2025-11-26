// File: components/TrackingPage.tsx (hoặc app/DriverDashboard/Tracking/page.tsx)
'use client';

import { AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic'; //  1. Import dynamic
import { useMemo } from 'react';     //  Import useMemo để tối ưu

// Dữ liệu giả lập cho thông tin chuyến đi
const tripInfo = {
  routeName: 'Tuyến A - Chuyến sáng',
  time: '6:30 - 8:00',
  studentsOnboard: 12,
  totalStudents: 15,
};

export default function TrackingPage() {
    
  //  2. Sử dụng dynamic import để MapView chỉ render ở client
  const DynamicMapView = useMemo(() => dynamic(
    () => import('@/components/Layouts/MapView'), // Đảm bảo đường dẫn đến MapView.tsx là chính xác
    { 
      ssr: false, // Tắt Server-Side Rendering cho component này
      loading: () => <p className="text-gray-500">Đang tải bản đồ...</p> // Hiển thị khi đang tải
    }
  ), []);

  return (
    <div className="p-6 md:p-8 h-full w-full bg-gray-50">
      {/* Header của trang */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Theo dõi hành trình
        </h1>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-sm hover:bg-yellow-600 transition-colors">
            Bắt đầu chuyến
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
            Kết thúc chuyến
          </button>
        </div>
      </div>

      {/* Lưới nội dung chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột chính: Bản đồ */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Bản đồ tuyến đường
            </h2>
            
            {/*  3. Thay thế div giữ chỗ bằng component bản đồ động */}
            <div className="h-[500px] w-full rounded-md overflow-hidden">
                <DynamicMapView />
            </div>

          </div>
        </div>

        {/* Cột phụ: Thông tin và Cảnh báo */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* ... Card Thông tin chuyến và Cảnh báo không đổi ... */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Thông tin chuyến
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Tuyến</p>
                <p className="text-lg font-semibold text-gray-800">{tripInfo.routeName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Thời gian</p>
                <p className="text-lg font-semibold text-gray-800">{tripInfo.time}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Học sinh</p>
                <p className="text-lg font-semibold text-gray-800">
                  {tripInfo.studentsOnboard}/{tripInfo.totalStudents} đã lên xe
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-700">
                Cảnh báo
              </h2>
            </div>
            <button className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors">
              Báo cáo sự cố
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}