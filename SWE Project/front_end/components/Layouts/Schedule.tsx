'use client';

// Dữ liệu giả lập cho lịch trình
const scheduleData = [
  {
    id: 1,
    day: 'Thứ 2',
    morning: '6:30 - 8:00',
    afternoon: '15:30 - 17:00',
    status: 'Hoàn thành',
  },
  {
    id: 2,
    day: 'Thứ 3',
    morning: '6:30 - 8:00',
    afternoon: '15:30 - 17:00',
    status: 'Đang thực hiện',
  },
  {
    id: 3,
    day: 'Thứ 4',
    morning: '6:30 - 8:00',
    afternoon: '15:30 - 17:00',
    status: 'Chưa bắt đầu',
  },
  // Thêm các ngày khác nếu cần
];

// Component con để hiển thị nhãn trạng thái
const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'Hoàn thành') {
    return (
      <span className="inline-block px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
        Hoàn thành
      </span>
    );
  }

  if (status === 'Đang thực hiện') {
    return (
      <span className="inline-block px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-full">
        Đang thực hiện
      </span>
    );
  }

  // Mặc định cho 'Chưa bắt đầu'
  return (
    <span className="text-sm font-medium text-gray-700">
      Chưa bắt đầu
    </span>
  );
};


export default function SchedulePage() {
  return (
    <div className="p-6 md:p-8 h-full w-full bg-gray-50">
      {/* Tiêu đề chính */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Lịch trình làm việc
      </h1>

      {/* Khung trắng chứa nội dung */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        
        {/* Tiêu đề phụ của bảng */}
        <h2 className="text-lg font-semibold text-gray-700 p-6 border-b border-gray-200">
          Lịch trình tuần này
        </h2>
        
        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <div className="min-w-full">

            {/* Header của Bảng (Tên các cột) */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-gray-50">
              <span className="text-sm font-semibold text-gray-500 uppercase">Ngày</span>
              <span className="text-sm font-semibold text-gray-500 uppercase">Chuyến sáng</span>
              <span className="text-sm font-semibold text-gray-500 uppercase">Chuyến chiều</span>
              <span className="text-sm font-semibold text-gray-500 uppercase">Trạng thái</span>
            </div>

            {/* Body của Bảng (Các hàng dữ liệu) */}
            <div className="divide-y divide-gray-200">
              {scheduleData.map((item) => (
                <div key={item.id} className="grid grid-cols-4 gap-4 px-6 py-5 items-center">
                  
                  {/* Ngày */}
                  <span className="text-gray-800 font-medium">{item.day}</span>
                  
                  {/* Chuyến sáng */}
                  <span className="text-gray-600">{item.morning}</span>
                  
                  {/* Chuyến chiều */}
                  <span className="text-gray-600">{item.afternoon}</span>
                  
                  {/* Trạng thái */}
                  <StatusBadge status={item.status} />
                
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}