"use client";

import React, { useState, useEffect, useCallback, ReactElement } from "react";
// Import icons
import { Clock, CheckCircle, XCircle, Bus, UserCheck, Calendar, Filter, Plus, Edit, Trash2, MapPin, Eye, ChevronLeft, ChevronRight, X, Info } from "lucide-react";

// ====================================================================
// 1. INTERFACES & TYPES (Giao diện dữ liệu)
// ====================================================================

interface coordinates { lng: number, lat: number }

interface Schedule {
    ScheduleID: number;
    RouteID: number;
    RouteName: string;
    BusID: string;
    DriverName: string;
    StartTime: string;
    EndTime: string;
    Date: string;
    CurrentLocation: coordinates | null; // Có thể null nếu chưa chạy
}

interface ScheduleFormData {
    RouteID: string;
    StartTime: string;
    EndTime: string;
    Date: string;
    // Status: 'Running' | 'Scheduled' | 'Completed' | 'Delayed' | 'Cancelled';
}

// ====================================================================
// 2. CONSTANTS & HELPER FUNCTIONS
// ====================================================================

const PRIMARY_COLOR = "bg-orange-500";
const PRIMARY_HOVER = "hover:bg-orange-600";
const RING_COLOR = "focus:ring-orange-200";
const itemsPerPage = 6;

// Giả định các dữ liệu dùng cho form (bạn cần lấy từ API thực tế)
const initialScheduleFormData: ScheduleFormData = {
    RouteID: '', StartTime: '08:00', EndTime: '10:00'
};
const mockRoutes = [
    { id: 1, name: 'Tuyến A - B (HCM)' },
    { id: 2, name: 'Tuyến C - D (HN)' },
];
const mockBuses = [
    { id: 'BUS001', name: 'Xe 1 - Mercedes' },
    { id: 'BUS002', name: 'Xe 2 - Huyndai' },
];

// Helper: Badge trạng thái
// const getStatusBadge = (status: Schedule['Status']): ReactElement => {
//     let colorClass = "bg-gray-100 text-gray-800";
//     let icon: ReactElement | null = null;
//     let label = status;

//     switch (status) {
//         case 'Running':
//             colorClass = "bg-green-100 text-green-800";
//             icon = <Bus className="w-3 h-3 mr-1 animate-pulse" />;
//             label = "Đang chạy";
//             break;
//         case 'Scheduled':
//             colorClass = "bg-blue-100 text-blue-800";
//             icon = <Clock className="w-3 h-3 mr-1" />;
//             label = "Dự kiến";
//             break;
//         case 'Completed':
//             colorClass = "bg-gray-100 text-gray-600";
//             icon = <CheckCircle className="w-3 h-3 mr-1" />;
//             label = "Hoàn thành";
//             break;
//         case 'Delayed':
//             colorClass = "bg-yellow-100 text-yellow-800";
//             icon = <XCircle className="w-3 h-3 mr-1" />;
//             label = "Trễ";
//             break;
//         case 'Cancelled':
//             colorClass = "bg-red-100 text-red-800";
//             icon = <XCircle className="w-3 h-3 mr-1" />;
//             label = "Đã hủy";
//             break;
//     }

//     return (
//         <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
//             {icon}
//             {label}
//         </span>
//     );
// };

// Helper: Giả lập lấy tọa độ tuyến đường (cần thay bằng API Map thực tế)
const fetchRouteCoordinates = async (routeId: number): Promise<coordinates[]> => {
    console.log(`API CALL GIẢ ĐỊNH: Fetching route coordinates for RouteID ${routeId}`);
    return []; // Trả về rỗng hoặc dữ liệu thực từ API Map
};

// ====================================================================
// 3. SERVICE LAYER (Sử dụng fetch API thực tế - Vui lòng thay URL)
// ====================================================================

const API_BASE_URL = "http://localhost:5000/Schedules"; // <--- THAY THẾ BẰNG BASE URL CỦA BẠN

const ScheduleService = {
    // GET: Lấy tất cả lịch trình
    async getAllSchedules(): Promise<Schedule[]> {
        // GIẢ LẬP DỮ LIỆU NẾU API LỖI HOẶC CHƯA CÓ
        // if (API_BASE_URL.includes("localhost:5000")) {
        //      console.log("Sử dụng dữ liệu giả lập vì API chưa kết nối");
        //      return [
        //          { ScheduleID: 101, RouteID: 1, RouteName: 'Tuyến A - B (HCM)', BusID: 'BUS001', DriverName: 'Nguyễn Văn A', StartTime: '08:00', EstimatedEndTime: '10:00', Status: 'Running', CurrentLocation: { lat: 10.762622, lng: 106.660172 } },
        //          { ScheduleID: 102, RouteID: 2, RouteName: 'Tuyến C - D (HN)', BusID: 'BUS002', DriverName: 'Lê Thị B', StartTime: '10:30', EstimatedEndTime: '12:30', Status: 'Scheduled', CurrentLocation: null },
        //          { ScheduleID: 103, RouteID: 1, RouteName: 'Tuyến A - B (HCM)', BusID: 'BUS003', DriverName: 'Trần Văn C', StartTime: '13:00', EstimatedEndTime: '15:00', Status: 'Completed', CurrentLocation: null },
        //          { ScheduleID: 104, RouteID: 2, RouteName: 'Tuyến C - D (HN)', BusID: 'BUS004', DriverName: 'Phạm Văn D', StartTime: '15:00', EstimatedEndTime: '17:00', Status: 'Delayed', CurrentLocation: { lat: 21.028511, lng: 105.804817 } },
        //          { ScheduleID: 105, RouteID: 1, RouteName: 'Tuyến A - B (HCM)', BusID: 'BUS005', DriverName: 'Võ Thị E', StartTime: '17:30', EstimatedEndTime: '19:30', Status: 'Scheduled', CurrentLocation: null },
        //          { ScheduleID: 106, RouteID: 2, RouteName: 'Tuyến C - D (HN)', BusID: 'BUS006', DriverName: 'Đặng Văn F', StartTime: '20:00', EstimatedEndTime: '22:00', Status: 'Cancelled', CurrentLocation: null },
        //          { ScheduleID: 107, RouteID: 1, RouteName: 'Tuyến A - B (HCM)', BusID: 'BUS007', DriverName: 'Nguyễn Văn G', StartTime: '07:00', EstimatedEndTime: '09:00', Status: 'Completed', CurrentLocation: null },
        //          { ScheduleID: 108, RouteID: 2, RouteName: 'Tuyến C - D (HN)', BusID: 'BUS008', DriverName: 'Lê Thị H', StartTime: '09:00', EstimatedEndTime: '11:00', Status: 'Running', CurrentLocation: { lat: 21.000000, lng: 105.800000 } },
        //      ] as Schedule[];
        // }

        // PHẦN NÀY LÀ API THỰC TẾ
        const response = await fetch(API_BASE_URL, {
            cache: 'no-store' // Để tránh cache cho real-time
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch schedules: ${response.statusText}`);
        }
        return response.json() as Promise<Schedule[]>;
    },

    // POST, PUT, DELETE giữ nguyên logic...
    async createSchedule(data: ScheduleFormData): Promise<Schedule> {
        // Mock success for UI if using mock data
        // if (API_BASE_URL.includes("localhost:5000")) {
        //     return { ScheduleID: Date.now(), RouteName: mockRoutes.find(r => String(r.id) === data.RouteID)?.name || 'New Route', CurrentLocation: null, ...data } as Schedule;
        // }
        const response = await fetch(`${API_BASE_URL}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) { throw new Error(`Failed to create schedule: ${response.statusText}`); }
        return response.json() as Promise<Schedule>;
    },
    async updateSchedule(id: number, data: ScheduleFormData): Promise<Schedule> {
        // Mock success for UI if using mock data
        // if (API_BASE_URL.includes("localhost:5000")) {
        //     return { ScheduleID: id, RouteName: mockRoutes.find(r => String(r.id) === data.RouteID)?.name || 'Updated Route', CurrentLocation: null, ...data } as Schedule;
        // }
        const response = await fetch(`${API_BASE_URL}/edit/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) { throw new Error(`Failed to update schedule: ${response.statusText}`); }
        return response.json() as Promise<Schedule>;
    },
    async deleteSchedule(id: number): Promise<void> {
        // Mock success for UI if using mock data
        if (API_BASE_URL.includes("localhost:5000")) { return; }
        const response = await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
        if (!response.ok) { throw new Error(`Failed to delete schedule: ${response.statusText}`); }
    },
};

// ====================================================================
// 4. CUSTOM HOOKS (Giữ nguyên)
// ====================================================================

// Hook để lấy và quản lý trạng thái dữ liệu
const useSchedules = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedules = useCallback(async (isInterval = false) => {
        if (!isInterval) setLoading(true);
        setError(null);
        try {
            const data = await ScheduleService.getAllSchedules();
            setSchedules(data.mergedData);
        } catch (err: any) {
            console.error("Lỗi tải lịch trình:", err);
            setError("Không thể tải dữ liệu lịch trình. Vui lòng kiểm tra API.");
        } finally {
            if (!isInterval) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
        const interval = setInterval(() => { fetchSchedules(true); }, 5000);
        return () => clearInterval(interval);
    }, [fetchSchedules]);

    return { schedules,setSchedules, loading, error, refetchSchedules: fetchSchedules };
};

// Hook để xử lý các hành động CRUD
const useScheduleActions = (
  refetchSchedules: () => void,
  setSchedules?: React.Dispatch<React.SetStateAction<Schedule[]>>
) => {
  const handleSaveSchedule = async (
    data: ScheduleFormData,
    isEdit: boolean,
    scheduleId: number | null
  ) => {
    try {
      let result: Schedule;

      if (isEdit && scheduleId) {
        // 🟢 Cập nhật lịch trình
        result = await ScheduleService.updateSchedule(scheduleId, data);

        if (setSchedules) {
          setSchedules(prev =>
            prev.map(s =>
              s.ScheduleID === result.ScheduleID ? result : s
            )
          );
        }

        alert(`✅ Cập nhật lịch trình ID ${result.ScheduleID} thành công!`);
      } else {
        // 🟢 Thêm lịch trình mới
        result = await ScheduleService.createSchedule(data);

        if (setSchedules) {
          setSchedules(prev => [result, ...prev]); // thêm vào đầu danh sách
        }

        alert(`✅ Tạo lịch trình mới ID ${result.ScheduleID} thành công!`);
      }

      // 🟡 Nếu không truyền setSchedules, fallback refetch
      if (!setSchedules) {
        refetchSchedules();
      }

      return true;
    } catch (err) {
      console.error("Lỗi thao tác lịch trình:", err);
      alert(`❌ Lỗi ${isEdit ? "cập nhật" : "tạo"} lịch trình. Vui lòng kiểm tra console.`);
      return false;
    }
  };

  const handleDeleteSchedule = async (schedule: Schedule) => {
    try {
      await ScheduleService.deleteSchedule(schedule.ScheduleID);

      if (setSchedules) {
        setSchedules(prev =>
          prev.filter(s => s.ScheduleID !== schedule.ScheduleID)
        );
      } else {
        refetchSchedules();
      }

      alert(`✅ Đã xóa Lịch trình ID ${schedule.ScheduleID}.`);
      return true;
    } catch (err) {
      console.error("Lỗi xóa lịch trình:", err);
      alert(`❌ Lỗi xóa lịch trình ID ${schedule.ScheduleID}.`);
      return false;
    }
  };

  return { handleSaveSchedule, handleDeleteSchedule };
};


// ====================================================================
// 5. COMPONENTS PHỤ (StatCard, Modal, Buttons, CRUD Modals)
// ====================================================================

// (StatCard, ModalWrapper, ScheduleFormModal, ScheduleDeleteModal, RunningScheduleCard: Giữ nguyên)
const StatCard = ({ label, value, color, icon: Icon }: { label: string, value: string, color: string, icon: React.ElementType }) => (
    <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}/20`}>
            <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
        </div>
    </div>
);

const ModalWrapper = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <div
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 "
        onClick={onClose}
    >
        <div
            className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
        >
            {children}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                title="Đóng"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    </div>
);

// const ScheduleFormModal = ({ isOpen, onClose, schedule, onSave }: any) => {
//     const isEdit = !!schedule;
//     // NOTE: Cần thêm logic ánh xạ data từ schedule (nếu có) vào formData để chỉnh sửa
//     const [formData, setFormData] = useState<ScheduleFormData>(
//         isEdit && schedule 
//             ? { ...initialScheduleFormData, ...schedule, RouteID: String(schedule.RouteID) } 
//             : initialScheduleFormData
//     );

//     useEffect(() => {
//         if (schedule) {
//              setFormData({ 
//                 RouteID: String(schedule.RouteID), BusID: schedule.BusID, DriverName: schedule.DriverName, 
//                 StartTime: schedule.StartTime, EstimatedEndTime: schedule.EstimatedEndTime, 
//                 Status: schedule.Status 
//             });
//         } else {
//             setFormData(initialScheduleFormData);
//         }
//     }, [schedule]);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         onSave(formData, isEdit, schedule ? schedule.ScheduleID : null).then((success: boolean) => {
//             if (success) onClose();
//         });
//     };

//     if (!isOpen) return null;

//     return (
//         <ModalWrapper onClose={onClose}>
//             <div className="p-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-5">{isEdit ? 'Chỉnh sửa Lịch trình' : 'Tạo Lịch trình mới'}</h3>
//                 <form onSubmit={handleSubmit}>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {/* Input Tuyến đường */}
//                         <div className="mb-4">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Tuyến đường <span className="text-red-500">*</span></label>
//                             <select name="RouteID" value={formData.RouteID} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
//                                 <option value="">-- Chọn Tuyến --</option>
//                                 {mockRoutes.map(route => (<option key={route.id} value={route.id}>{route.name}</option>))}
//                             </select>
//                         </div>
//                         {/* Input Mã xe buýt */}
//                         <div className="mb-4">
//                              <label className="block text-sm font-medium text-gray-700 mb-1">Mã xe buýt <span className="text-red-500">*</span></label>
//                             <select name="BusID" value={formData.BusID} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
//                                 <option value="">-- Chọn Mã xe --</option>
//                                 {mockBuses.map(bus => (<option key={bus.id} value={bus.id}>{bus.name}</option>))}
//                             </select>
//                         </div>
//                         {/* Input Tài xế */}
//                         <div className="mb-4">
//                              <label className="block text-sm font-medium text-gray-700 mb-1">Tài xế <span className="text-red-500">*</span></label>
//                              <input type="text" name="DriverName" value={formData.DriverName} onChange={handleChange} required placeholder="Tên tài xế" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"/>
//                         </div>
//                         <div className="mb-4">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái <span className="text-red-500">*</span></label>
//                              <select name="Status" value={formData.Status} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
//                                  <option value="Scheduled">Dự kiến</option>
//                                  <option value="Running">Đang chạy</option>
//                                  <option value="Completed">Hoàn thành</option>
//                                  <option value="Delayed">Trễ</option>
//                                  <option value="Cancelled">Đã hủy</option>
//                             </select>
//                         </div>
//                         <div className="mb-4">
//                              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian Bắt đầu <span className="text-red-500">*</span></label>
//                              <input type="time" name="StartTime" value={formData.StartTime} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"/>
//                         </div>
//                         <div className="mb-4">
//                              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian Kết thúc (dự kiến) <span className="text-red-500">*</span></label>
//                              <input type="time" name="EstimatedEndTime" value={formData.EstimatedEndTime} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"/>
//                         </div>
//                     </div>

//                     <div className="flex justify-end gap-3 mt-6">
//                         <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition">Hủy</button>
//                         <button type="submit" className={`px-4 py-2 text-sm font-medium rounded-md text-white ${PRIMARY_COLOR} ${PRIMARY_HOVER} transition shadow-md shadow-orange-300`}>
//                             {isEdit ? 'Lưu thay đổi' : 'Tạo lịch trình'}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </ModalWrapper>
//     );
// };
const ScheduleFormModal = ({ isOpen, onClose, schedule, onSave }: any) => {
    const isEdit = !!schedule;

    // --- KHỞI TẠO STATE ---

    // Lấy ngày hôm nay dưới dạng YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Hàm khởi tạo dữ liệu form (chỉ lấy 4 trường cần thiết)
    const getInitialFormData = (s: Schedule | null): ScheduleFormData => {
        if (s) {
            return {
                RouteID: String(s.RouteID),
                Date: s.Date || today,
                StartTime: s.StartTime,
                EndTime: s.EndTime,
            };
        }
        // Dữ liệu mặc định khi tạo mới
        return {
            RouteID: '',
            Date: today,
            StartTime: '08:00',
            EndTime: '10:00',
        };
    };

    const [formData, setFormData] = useState<ScheduleFormData>(getInitialFormData(schedule));

    // Cập nhật state khi prop schedule thay đổi (cho edit)
    useEffect(() => {
        setFormData(getInitialFormData(schedule));
    }, [schedule]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Gửi dữ liệu đi, thêm Status mặc định (Scheduled) hoặc giữ Status cũ nếu là Edit
        const dataToSend = isEdit
            ? { ...formData}
            : { ...formData};

        onSave(dataToSend, isEdit, schedule ? schedule.ScheduleID : null).then((success: boolean) => {
            if (success) onClose();
        });
    };

    if (!isOpen) return null;

    // --- JSX (Giao diện) ---
    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-5">{isEdit ? 'Chỉnh sửa Lịch trình' : 'Tạo Lịch trình mới'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* 1. Input Tuyến đường (RouteID) */}
                        <div className="mb-4 col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tuyến đường <span className="text-red-500">*</span></label>

                            <input
                                type="text"
                                name="RouteID"
                                value={formData.RouteID}
                                onChange={handleChange}
                                required
                                placeholder="Nhập Tuyến..."
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            />
                        </div>

                        {/* 2. Input Ngày (Date) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="Date"
                                value={formData.Date}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            />
                        </div>

                        {/* 3. Input Thời gian Bắt đầu (StartTime) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian Bắt đầu <span className="text-red-500">*</span></label>
                            <input
                                type="time"
                                name="StartTime"
                                value={formData.StartTime}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            />
                        </div>

                        {/* 4. Input Thời gian Kết thúc (EstimatedEndTime) */}
                        <div className="mb-4 col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian Kết thúc (dự kiến) <span className="text-red-500">*</span></label>
                            <input
                                type="time"
                                name="EndTime"
                                value={formData.EndTime}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            />
                        </div>

                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition">Hủy</button>
                        <button type="submit" className={`px-4 py-2 text-sm font-medium rounded-md text-white ${PRIMARY_COLOR} ${PRIMARY_HOVER} transition shadow-md shadow-orange-300`}>
                            {isEdit ? 'Lưu thay đổi' : 'Tạo lịch trình'}
                        </button>
                    </div>
                </form>
            </div>
        </ModalWrapper>
    );
};
const ScheduleDeleteModal = ({ isOpen, onClose, schedule, onDelete }: any) => {
    if (!isOpen || !schedule) return null;

    const handleDelete = () => {
        onDelete(schedule).then((success: boolean) => {
            if (success) onClose();
        });
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-6 text-center">
                <div className="flex justify-center mb-4"><Trash2 className="w-12 h-12 text-red-500" /></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận Xóa Lịch trình?</h3>
                <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa lịch trình **{schedule.RouteName} (ID: {schedule.ScheduleID})**?</p>

                <div className="flex justify-center gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition">Hủy</button>
                    <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition shadow-md shadow-red-300">Xác nhận Xóa</button>
                </div>
            </div>
        </ModalWrapper>
    );
};

const RunningScheduleCard = ({ schedule }: { schedule: Schedule }) => (
    <div className="p-5 rounded-xl shadow-lg border border-green-200 bg-white hover:shadow-xl transition duration-300 cursor-pointer relative overflow-hidden">
        {/* ... CSS pulse effect ... */}
        <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-lg text-gray-900">{schedule.RouteName}</h4>
            {/* {getStatusBadge(schedule.Status)} */}
        </div>
        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1"><UserCheck className="w-4 h-4 text-green-500" /> Tài xế: **{schedule.DriverName}**</p>
        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1"><Bus className="w-4 h-4 text-orange-500" /> Mã xe: **{schedule.BusID}**</p>
        {schedule.CurrentLocation && (
            <p className="text-xs text-blue-500 mt-2 font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Vị trí (Live): {schedule.CurrentLocation.lat.toFixed(4)}, {schedule.CurrentLocation.lng.toFixed(4)}
            </p>
        )}
    </div>
);

/**
 * COMPONENT MỚI: Modal hiển thị chi tiết lịch trình
 */
const ScheduleDetailModal = ({ isOpen, onClose, schedule }: { isOpen: boolean, onClose: () => void, schedule: Schedule | null }) => {
    if (!isOpen || !schedule) return null;

    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Info className="w-6 h-6 text-orange-500" /> Chi tiết Lịch trình: **{schedule.RouteName}**</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    {/* <div className="col-span-2 border-b pb-2 mb-2">
                        <span className="font-semibold text-gray-600">Trạng thái:</span> {getStatusBadge(schedule.Status)}
                    </div> */}

                    <div className="space-y-1">
                        <p><span className="font-semibold text-gray-600">ID Lịch trình:</span> <span className="font-mono text-gray-800">{schedule.ScheduleID}</span></p>
                        <p><span className="font-semibold text-gray-600">ID Tuyến:</span> <span className="font-mono text-gray-800">{schedule.RouteID}</span></p>
                        <p><span className="font-semibold text-gray-600">Tên Tuyến:</span> <span className="font-medium text-gray-800">{schedule.RouteName}</span></p>
                    </div>

                    <div className="space-y-1">
                        <p><span className="font-semibold text-gray-600">Tài xế:</span> <span className="font-medium text-gray-800">{schedule.DriverName}</span></p>
                        <p><span className="font-semibold text-gray-600">Mã xe buýt:</span> <span className="font-mono text-gray-800">{schedule.BusID}</span></p>
                    </div>

                    <div className="space-y-1 border-t pt-4 mt-4 col-span-2">
                        <p><span className="font-semibold text-gray-600">Giờ Bắt đầu:</span> <span className="font-medium text-green-600">{schedule.StartTime}</span></p>
                        <p><span className="font-semibold text-gray-600">Giờ Kết thúc (Dự kiến):</span> <span className="font-medium text-red-600">{schedule.EndTime}</span></p>
                    </div>

                    {/* {schedule.CurrentLocation && (
                        <div className="space-y-1 bg-blue-50 p-3 rounded-lg col-span-2 mt-2">
                            <p className="flex items-center gap-1 text-sm text-blue-800"><MapPin className="w-4 h-4"/> <span className="font-semibold">Vị trí hiện tại:</span></p>
                            <p className="pl-6 text-xs text-blue-700">Latitude: {schedule.CurrentLocation.lat.toFixed(6)}, Longitude: {schedule.CurrentLocation.lng.toFixed(6)}</p>
                        </div>
                    )} */}
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-md text-white ${PRIMARY_COLOR} ${PRIMARY_HOVER} transition shadow-md`}>Đóng</button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ====================================================================
// 6. COMPONENT CHÍNH: SCHEDULES PAGE (Tích hợp Hooks và UI)
// ====================================================================

export default function SchedulesPage() {
    // 1. SỬ DỤNG HOOKS
    const { schedules, loading, error, refetchSchedules,setSchedules } = useSchedules();
    const { handleSaveSchedule, handleDeleteSchedule } = useScheduleActions(refetchSchedules,setSchedules);

    // 2. STATE VÀ LOGIC UI
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [mapCoordinates, setMapCoordinates] = useState<coordinates[]>([]);
    const [mapLoading, setMapLoading] = useState(false);

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Effect để cập nhật bản đồ khi dữ liệu thay đổi
    // useEffect(() => {
    //     if (!selectedSchedule && schedules.length > 0) {
    //         // Tự động chọn tuyến đang chạy đầu tiên để hiển thị trên bản đồ khi load
    //         const initialSelection = schedules.find(s => s.Status === 'Running') || schedules[0];
    //         if (initialSelection) {
    //             displayRouteOnMap(initialSelection);
    //         }
    //     }
    // }, [schedules]);

    // --- HÀM XỬ LÝ SỰ KIỆN UI ---
    const displayRouteOnMap = async (schedule: Schedule) => {
        setMapLoading(true);
        setSelectedSchedule(schedule);
        try {
            const coords = await fetchRouteCoordinates(schedule.RouteID);
            setMapCoordinates(coords);
        } catch (err: any) {
            console.error(err);
        } finally {
            setMapLoading(false);
        }
    };

    // --- Lọc và Phân trang ---
    const filteredSchedules = schedules.filter(schedule => {
        const searchTermLower = String(searchTerm).toLowerCase();
        const matchesSearch = String(schedule.RouteName).toLowerCase().includes(searchTermLower) ||
            String(schedule.BusID).toLowerCase().includes(searchTermLower) ||
            String(schedule.DriverName).toLowerCase().includes(searchTermLower);
        // const matchesStatus = filterStatus === 'all' || String(schedule.Status).toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch
        // && matchesStatus;
    });

    const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // --- Logic mở Modal ---
    const handleOpenAddModal = () => { setSelectedSchedule(null); setShowFormModal(true); };
    const handleOpenEditModal = (schedule: Schedule, e: React.MouseEvent) => { e.stopPropagation(); setSelectedSchedule(schedule); setShowFormModal(true); };
    const handleOpenDetailModal = (schedule: Schedule, e: React.MouseEvent) => { e.stopPropagation(); setSelectedSchedule(schedule); setShowDetailModal(true); };
    const handleOpenDeleteModal = (schedule: Schedule, e: React.MouseEvent) => { e.stopPropagation(); setSelectedSchedule(schedule); setShowDeleteModal(true); };

    // const runningSchedules = schedules.filter(s => s.Status === 'Running');

    if (loading && schedules.length === 0) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen w-full flex items-center justify-center">
                <div className="text-center text-gray-700">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-orange-500 mx-auto mb-3"></div>
                    <p className="font-semibold">Đang tải dữ liệu lịch trình...</p>
                    <p className="text-sm text-gray-500 mt-1">Kiểm tra kết nối API tại `{API_BASE_URL}`</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen w-full font-sans">

            {/* Header */}
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">📅 Quản lý Lịch trình Vận hành</h1>
                    <p className="text-gray-500 text-base">Theo dõi trạng thái và vị trí các tuyến xe buýt theo thời gian thực.</p>
                </div>
                <button
                    suppressHydrationWarning={true}
                    onClick={handleOpenAddModal}
                    className={`flex items-center gap-2 ${PRIMARY_COLOR} text-white px-6 py-3 rounded-xl border-none cursor-pointer font-semibold transition duration-200 shadow-md shadow-orange-300 ${PRIMARY_HOVER} active:bg-orange-700 ring-4 ${RING_COLOR}`}
                >
                    <Plus className="w-5 h-5" />
                    Tạo Lịch trình mới
                </button>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                    <span className="font-medium">Lỗi dữ liệu:</span> {error}
                </div>
            )}

            {/* Thống kê nhanh */}
            {/* <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Tổng lịch trình" value={schedules.length.toString()} color="bg-orange-400" icon={Calendar} />
                <StatCard label="Đang hoạt động" value={runningSchedules.length.toString()} color="bg-green-500" icon={Bus} />
                <StatCard label="Dự kiến" value={schedules.filter(s => s.Status === 'Scheduled').length.toString()} color="bg-blue-400" icon={Clock} />
                <StatCard label="Đã hoàn thành" value={schedules.filter(s => s.Status === 'Completed').length.toString()} color="bg-gray-400" icon={CheckCircle} />
            </div> */}

            {/* Bản đồ & Lịch trình đang hoạt động */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                {/* 1. Map View */}
                <div className="lg:w-2/3 h-[550px] bg-white rounded-xl shadow-2xl overflow-hidden p-4 flex items-center justify-center relative border border-gray-200">
                    <h3 className="absolute z-10 top-4 left-4 text-lg font-bold text-gray-800 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-lg"><MapPin className="w-5 h-5 text-orange-500" /> Giám sát Vị trí (Real-time)</h3>
                    {mapLoading ? (
                        <div className="text-center text-gray-500 flex items-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div> Đang tải bản đồ...</div>
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-center absolute">
                                Bản đồ giả lập: Đã tải **{mapCoordinates.length}** điểm tuyến đường.
                                {selectedSchedule && <p className="mt-2 text-sm font-medium">Đang hiển thị tuyến: **{selectedSchedule.RouteName}**</p>}
                                <p className="mt-1 text-xs text-gray-400">Nhấn vào một lịch trình để hiển thị tuyến đường trên bản đồ</p>
                            </span>
                        </div>
                    )}
                </div>

                {/* 2. Lịch trình đang hoạt động */}
                {/* <div className="lg:w-1/3 space-y-4 max-h-[550px] overflow-y-auto pr-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 sticky top-0 bg-gray-50 z-10 py-1 flex items-center gap-2"><Bus className="w-6 h-6 text-green-600"/> Lịch trình đang chạy ({runningSchedules.length})</h3>
                    {runningSchedules.length > 0 ? (
                        runningSchedules.map((schedule) => (
                            <RunningScheduleCard key={schedule.ScheduleID} schedule={schedule} />
                        ))
                    ) : (
                        <div className="bg-white p-6 rounded-xl shadow-md text-center text-gray-500 border border-gray-200">
                            Hiện không có lịch trình nào đang hoạt động.
                        </div>
                    )}
                </div> */}
            </div>

            {/* Bảng quản lý Lịch trình chi tiết */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center">
                    {/* Search & Filter */}
                    <div suppressHydrationWarning={true} className="relative flex-1 min-w-[250px]"><Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" /><input suppressHydrationWarning={true} type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 ${RING_COLOR}`} /></div>
                    {['all', 'Running', 'Scheduled', 'Completed', 'Delayed', 'Cancelled'].map(status => (
                        <button suppressHydrationWarning={true} key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition duration-200 ${filterStatus === status.toLowerCase() ? `${PRIMARY_COLOR} text-white shadow-md` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} focus:outline-none focus:ring-4 ${RING_COLOR}`}>{status === 'all' ? 'Tất cả' : status}</button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200"><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule ID</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Route Name</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Route ID</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver Name</th><th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">BusID</th><th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th><th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th></tr>
                        </thead>
                        <tbody>
                            {currentSchedules.length > 0 ? (
                                currentSchedules.map((schedule) => (
                                    <tr key={schedule.ScheduleID} onClick={() => displayRouteOnMap(schedule)} className={`border-b border-gray-100 transition duration-200 hover:bg-gray-50 cursor-pointer ${selectedSchedule?.ScheduleID === schedule.ScheduleID ? 'bg-orange-50 border-orange-200 shadow-inner' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap"><p className="font-medium text-sm text-gray-900">{schedule.ScheduleID}</p></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><p className="font-medium text-sm text-gray-900">{schedule.RouteName}</p></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><p className="font-medium text-sm text-gray-900">{schedule.RouteID}</p></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><p className="font-medium text-sm text-gray-900">{schedule.DriverName}</p></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><p className="font-medium text-sm text-gray-900">{schedule.BusID}</p></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><p className="font-medium text-sm text-gray-900">{`${schedule.StartTime}-${schedule.EndTime}`}</p></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><p className="font-medium text-sm text-gray-900">{schedule.Date}</p></td>


                                        {/* <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(schedule.Status)}</td> */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={(e) => handleOpenDetailModal(schedule, e)} className="p-2 rounded-full transition duration-200 hover:bg-blue-100 text-blue-500" title="Chi tiết"><Eye className="w-4 h-4" /></button>
                                                <button onClick={(e) => handleOpenEditModal(schedule, e)} className="p-2 rounded-full transition duration-200 hover:bg-green-100 text-green-600" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
                                                <button onClick={(e) => handleOpenDeleteModal(schedule, e)} className="p-2 rounded-full transition duration-200 hover:bg-red-100 text-red-600" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center p-12 text-gray-500 bg-gray-50">Không tìm thấy lịch trình nào phù hợp</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 flex items-center justify-between border-t border-gray-100 bg-white">
                    <div className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">{startIndex + 1}</span> đến <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredSchedules.length)}</span> trong tổng số <span className="font-medium">{filteredSchedules.length}</span> lịch trình
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg text-sm font-medium transition ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <ChevronLeft className="w-5 h-5 inline" /> Trang trước
                        </button>

                        {/* Số trang */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${page === currentPage ? `${PRIMARY_COLOR} text-white shadow-md` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`p-2 rounded-lg text-sm font-medium transition ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            Trang sau <ChevronRight className="w-5 h-5 inline" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals CRUD & Detail */}
            <ScheduleDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                schedule={selectedSchedule}
            />

            <ScheduleFormModal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                schedule={selectedSchedule}
                addNewSchedule={setSchedules}
                onSave={handleSaveSchedule}
            />

            <ScheduleDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                schedule={selectedSchedule}
                onDelete={handleDeleteSchedule}
            />

        </div>
    );
}