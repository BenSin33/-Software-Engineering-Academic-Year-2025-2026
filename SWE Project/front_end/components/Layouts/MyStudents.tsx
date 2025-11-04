'use client';

import { CheckCircle, Clock } from 'lucide-react';

const students = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    class: '6A1',
    pickupPoint: 'Trường THCS ABC',
    statusMorning: 'Đã đón',
    statusAfternoon: 'Chưa đến giờ',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    class: '6A2',
    pickupPoint: 'Trường THCS XYZ',
    statusMorning: 'Đã đón',
    statusAfternoon: 'Chưa đến giờ',
  },
];

const StatusPill = ({ status }: { status: string }) => {
  if (status === 'Đã đón') {
    return (
      <div className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full bg-green-100 text-green-700">
        <CheckCircle size={16} />
        <span className="font-medium text-sm">Đã đón</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
      <Clock size={16} />
      <span className="font-medium text-sm">Chưa đến giờ</span>
    </div>
  );
};

export default function MyStudentsPage() {
  return (
    <div className="p-6 md:p-8 h-full w-full bg-gray-50">
      {/* Tiêu đề chính */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        Danh sách học sinh
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Học sinh trên tuyến A
      </p>

      {/* Khung chứa bảng danh sách */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tiêu đề của bảng (Table Header) */}
        <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="col-span-1 text-sm font-semibold text-gray-500 uppercase">Tên học sinh</div>
          <div className="col-span-1 text-sm font-semibold text-gray-500 uppercase">Lớp</div>
          <div className="col-span-1 text-sm font-semibold text-gray-500 uppercase">Điểm đón</div>
          <div className="col-span-1 text-sm font-semibold text-gray-500 uppercase">Sáng</div>
          <div className="col-span-1 text-sm font-semibold text-gray-500 uppercase">Chiều</div>
        </div>

        {/* Danh sách học sinh (Table Body) */}
        <div className="divide-y divide-gray-200">
          {students.map((student) => (
            <div key={student.id} className="grid grid-cols-5 gap-4 px-6 py-4 items-center">
              {/* Tên học sinh */}
              <div className="col-span-1">
                <p className="font-medium text-gray-800">{student.name}</p>
              </div>
              {/* Lớp */}
              <div className="col-span-1">
                <p className="text-gray-600">{student.class}</p>
              </div>
              {/* Điểm đón */}
              <div className="col-span-1">
                <p className="text-gray-600">{student.pickupPoint}</p>
              </div>
              {/* Sáng */}
              <div className="col-span-1">
                <StatusPill status={student.statusMorning} />
              </div>
              {/* Chiều */}
              <div className="col-span-1">
                <StatusPill status={student.statusAfternoon} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}