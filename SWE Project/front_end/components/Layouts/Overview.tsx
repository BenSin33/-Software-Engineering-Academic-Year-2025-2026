'use client';

import { CheckCircle, MapPin, Bus, Users, Clock } from 'lucide-react';

// Dữ liệu giả lập
const driverName = "Nguyễn Văn An";
const tripCount = 2;

// Component con cho 3 thẻ thống kê bên dưới
const StatCard = ({ title, mainText, subtitle, icon: Icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md h-full">
    <div className="flex justify-between items-start mb-2">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <Icon className="w-5 h-5 text-gray-400" />
    </div>
    <p className="text-3xl font-bold text-gray-800">{mainText}</p>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

export default function OverviewPage() {
  return (
    <div className="p-6 md:p-8 h-full w-full bg-gray-50">
      
      {/* --- PHẦN HEADER --- */}
      <div className="flex justify-between items-center mb-6">
        {/* Chào buổi sáng */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Chào buổi sáng, {driverName}!
          </h1>
          <p className="text-lg text-gray-600">
            Hôm nay bạn có {tripCount} chuyến xe
          </p>
        </div>
        
        {/* Trạng thái */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700">
          <CheckCircle size={16} />
          <span className="font-medium text-sm">Đang hoạt động</span>
        </div>
      </div>

      {/* --- PHẦN LỊCH TRÌNH HÔM NAY --- */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <MapPin size={20} className="text-gray-500" />
          Lịch trình hôm nay
        </h2>

        <div className="space-y-4">
          {/* Chuyến 1 - Đang hoạt động */}
          <div className="flex justify-between items-center bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-white font-bold text-lg">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-800">Chuyến sáng - Tuyến A</p>
                <span className="text-sm text-gray-600">6:30 - 8:00 • 15 học sinh</span>
              </div>
            </div>
            <button className="px-5 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-sm hover:bg-yellow-600 transition-colors">
              Bắt đầu
            </button>
          </div>

          {/* Chuyến 2 - Chờ */}
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-700 font-bold text-lg">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-800">Chuyến chiều - Tuyến A</p>
                <span className="text-sm text-gray-600">15:30 - 17:00 • 15 học sinh</span>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-700 px-5 py-2">
              Chưa bắt đầu
            </span>
          </div>
        </div>
      </div>

      {/* --- PHẦN 3 THẺ THỐNG KÊ --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Xe được giao"
          mainText="SSB-01"
          subtitle="Trạng thái: Tốt"
          icon={Bus}
        />
        <StatCard
          title="Học sinh hôm nay"
          mainText="15"
          subtitle="Trên tuyến A"
          icon={Users}
        />
        <StatCard
          title="Thời gian làm việc"
          mainText="3.5h"
          subtitle="Trong ngày"
          icon={Clock}
        />
      </div>
    </div>
  );
}