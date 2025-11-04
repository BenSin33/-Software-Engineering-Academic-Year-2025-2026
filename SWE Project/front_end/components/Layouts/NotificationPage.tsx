'use client';

import { Bell, AlertTriangle } from 'lucide-react';

// Dữ liệu thông báo giả lập
const alerts = [
  {
    id: 1,
    type: 'warning',
    message: 'Xe BUS-05 sắp đến hạn bảo dưỡng.',
    time: '2 giờ trước',
  },
  {
    id: 2,
    type: 'info',
    message: 'Tuyến đường buổi chiều đã được cập nhật.',
    time: 'Hôm qua',
  },
  {
    id: 3,
    type: 'warning',
    message: 'Phụ huynh học sinh Nguyễn Văn A báo nghỉ hôm nay.',
    time: 'Hôm qua',
  },
];

// Component Icon để chọn icon dựa trên loại thông báo
const Icon = ({ type }) => {
    if (type === 'warning') {
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    }
    // Mặc định là icon thông tin
    return <Bell className="w-6 h-6 text-blue-500" />;
}

export default function AlertsPage() {
  return (
    // ✅ 1. Đổi màu nền trang thành màu xám rất nhạt (gần như trắng)
    <div className="p-6 md:p-8 h-full bg-gray-100">
      
      {/* ✅ 2. Đổi màu chữ tiêu đề thành màu tối */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Cảnh báo & Thông báo
      </h1>
      
      {/* ✅ 3. Đổi màu nền của khung chứa thông báo thành màu trắng */}
      <div className="bg-white rounded-lg shadow-md">
        <ul className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <li key={alert.id} className="p-4 flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <Icon type={alert.type} />
              </div>
              <div className="flex-1">
                {/* ✅ 4. Đổi màu chữ của nội dung và thời gian thành màu tối */}
                <p className="text-md text-gray-700">{alert.message}</p>
                <p className="text-sm text-gray-500 mt-1">{alert.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}