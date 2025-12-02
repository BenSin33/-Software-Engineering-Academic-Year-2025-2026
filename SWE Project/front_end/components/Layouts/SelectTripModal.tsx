// File: components/SelectTripModal.tsx
'use client';

import { X, Clock, MapPin } from 'lucide-react';

interface Trip {
  id: number;
  routeName: string;
  startTime: string;
  endTime: string;
  date: string;
  status: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  onSelect: (tripId: number) => void;
}

export default function SelectTripModal({ isOpen, onClose, trips, onSelect }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Chọn chuyến để bắt đầu</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        {/* Danh sách chuyến */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {trips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có chuyến nào chờ khởi hành hôm nay.
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip: any) => (
                <div 
                  // ✅ SỬA 1: Dùng ScheduleID làm key
                  key={trip.ScheduleID} 
                  
                  className="border border-gray-200 rounded-lg p-4 hover:border-orange-400 hover:bg-orange-50 transition cursor-pointer group"
                  
                  // ✅ SỬA 2: Truyền ScheduleID vào hàm select
                  onClick={() => onSelect(trip.ScheduleID)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-800">
                       {/* Hiển thị tên tuyến hoặc ID */}
                       {trip.RouteName || `Tuyến #${trip.RouteID}`}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {trip.TimeStart?.slice(0, 5)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 flex gap-2">
                     <span>📅 {new Date(trip.Date).toLocaleDateString('vi-VN')}</span>
                     <span>•</span>
                     <span>🆔 {trip.ScheduleID}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
            <button onClick={onClose} className="text-sm text-gray-500 hover:underline">Đóng</button>
        </div>
      </div>
    </div>
  );
}