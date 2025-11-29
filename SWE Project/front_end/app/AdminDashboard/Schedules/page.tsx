"use client";

import React, { useState, useEffect, useCallback, ReactElement } from "react";
// Import icons
import { Clock, CheckCircle, XCircle, Bus, UserCheck, Calendar, Filter, Plus, Edit, Trash2, MapPin, Eye, ChevronLeft, ChevronRight, X, Info } from "lucide-react";
import MapView from "@/components/Layouts/MapView";
import { callService } from "@/utils/callService";

// ====================================================================
// 1. INTERFACES & TYPES (Giao diện dữ liệu)
// ====================================================================

interface coordinates { lng: number, lat: number }
type Route = coordinates[];
type Routes = Route[];

interface Schedule {
    ScheduleID: number;
    Status: string;
    RouteID: number | string;
    RouteName: string;
    BusID: string;
    DriverName: string;
    DriverID: number;
    StartTime: string;
    EndTime: string;
    Date: string;
    CurrentLocation: coordinates | null; 
}

interface ScheduleFormData {
    RouteID: string;
    StartTime: string;
    DriverID: string;
    EndTime: string;
    Date: string;
}

// ====================================================================
// 2. CONSTANTS & HELPER FUNCTIONS
// ====================================================================

const PRIMARY_COLOR = "bg-orange-500";
const PRIMARY_HOVER = "hover:bg-orange-600";
const RING_COLOR = "focus:ring-orange-200";
const itemsPerPage = 6;

// Helper: Giả lập lấy tọa độ tuyến đường (cần thay bằng API Map thực tế)
const fetchRouteCoordinates = async (routeId: number | string): Promise<coordinates[]> => {
    // console.log(`API CALL GIẢ ĐỊNH: Fetching route coordinates for RouteID ${routeId}`);
    return []; 
};

// ====================================================================
// 3. SERVICE LAYER (QUAN TRỌNG: Đã sửa lại để khớp với API Gateway)
// ====================================================================

const API_BASE_URL = "http://localhost:5000/Schedules"; 

const ScheduleService = {
    // GET: Lấy tất cả lịch trình
    async getAllSchedules(): Promise<any> {
        const response = await fetch(API_BASE_URL, {
            cache: 'no-store' 
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch schedules: ${response.statusText}`);
        }
        // Backend trả về: { message: "...", mergedData: [...] }
        return response.json(); 
    },

    // POST: Thêm mới
    async createSchedule(data: ScheduleFormData): Promise<Schedule> {
        const response = await fetch(`${API_BASE_URL}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) { 
            const errData = await response.json();
            throw new Error(errData.message || `Failed to create schedule`); 
        }

        // Backend trả về: { message: "Success", data: { ScheduleID: ... } }
        // Chúng ta cần lấy cái .data để cập nhật vào State
        const result = await response.json();
        return result.data; 
    },

    // PUT: Cập nhật
    async updateSchedule(id: number, data: ScheduleFormData): Promise<Schedule> {
        const response = await fetch(`${API_BASE_URL}/edit/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) { 
            const errData = await response.json();
            throw new Error(errData.message || `Failed to update schedule`); 
        }

        const result = await response.json();
        return result.data; // Lấy data thực sự
    },

    // DELETE: Xóa
    async deleteSchedule(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
        if(!response.ok) throw new Error('Lỗi xóa lịch trình');
    },
};

// ====================================================================
// 4. CUSTOM HOOKS
// ====================================================================

const useSchedules = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedules = useCallback(async (isInterval = false) => {
        if (!isInterval) setLoading(true);
        setError(null);
        try {
            const data = await ScheduleService.getAllSchedules();
            // Backend trả về key là "mergedData"
            if (data && data.mergedData) {
                setSchedules(data.mergedData);
            } else {
                setSchedules([]);
            }
        } catch (err: any) {
            console.error("Lỗi tải lịch trình:", err);
            setError("Không thể tải dữ liệu lịch trình. Vui lòng kiểm tra API.");
        } finally {
            if (!isInterval) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
        // Polling mỗi 20s
        const interval = setInterval(() => { fetchSchedules(true); }, 20000);
        return () => clearInterval(interval);
    }, [fetchSchedules]);

    return { schedules, setSchedules, loading, error, refetchSchedules: fetchSchedules };
};

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
        // Cập nhật
        result = await ScheduleService.updateSchedule(scheduleId, data);
        if (setSchedules) {
          setSchedules(prev =>
            prev.map(s => (s.ScheduleID === result.ScheduleID ? result : s))
          );
        }
        alert(`✅ Cập nhật lịch trình thành công!`);
      } else {
        // Thêm mới
        result = await ScheduleService.createSchedule(data);
        if (setSchedules) {
          // Thêm item mới vào đầu danh sách ngay lập tức
          setSchedules(prev => [result, ...prev]);
        }
        alert(`✅ Tạo lịch trình mới thành công!`);
      }

      // Nếu không có setSchedules thì gọi API load lại toàn bộ
      if (!setSchedules) {
        refetchSchedules();
      }

      return true;
    } catch (err: any) {
      console.error("Lỗi thao tác lịch trình:", err);
      alert(`❌ Lỗi: ${err.message}`);
      return false;
    }
  };

  const handleDeleteSchedule = async (schedule: Schedule) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lịch trình ID ${schedule.ScheduleID}?`)) return false;

    try {
      await ScheduleService.deleteSchedule(schedule.ScheduleID);

      if (setSchedules) {
        setSchedules(prev =>
          prev.filter(s => Number(s.ScheduleID) !== Number(schedule.ScheduleID))
        );
      } else {
        refetchSchedules();
      }

      alert(`✅ Đã xóa lịch trình thành công.`);
      return true;
    } catch (err: any) {
      console.error("Lỗi xóa lịch trình:", err);
      alert(`❌ Lỗi xóa: ${err.message}`);
      return false;
    }
  };

  return { handleSaveSchedule, handleDeleteSchedule };
};

// ====================================================================
// 5. COMPONENTS PHỤ (StatCard, Modal...)
// ====================================================================

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
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
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

const ScheduleFormModal = ({ isOpen, onClose, schedule, onSave, formatDate }: any) => {
    const isEdit = !!schedule;
    const today = new Date().toISOString().split('T')[0];

    const [driverList, setDriverList] = useState<any[]>([]);

    const getInitialFormData = (s: Schedule | null): ScheduleFormData => {
        if (s) {
            return {
                RouteID: String(s.RouteID),
                DriverID: s.DriverID ? String(s.DriverID) : '',
                Date: s.Date || today,
                StartTime: s.StartTime,
                EndTime: s.EndTime,
            };
        }
        return {
            RouteID: '',
            Date: today,
            DriverID: '',
            StartTime: '08:00',
            EndTime: '10:00',
        };
    };

    const [formData, setFormData] = useState<ScheduleFormData>(getInitialFormData(schedule));

    // Cập nhật state khi prop schedule thay đổi (cho edit)
    useEffect(() => {
        setFormData(getInitialFormData(schedule));
    }, [schedule, isOpen]); // Reset form khi mở modal

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, isEdit, schedule ? schedule.ScheduleID : null).then((success: boolean) => {
            if (success) onClose();
        });
    };

    if (!isOpen) return null;

    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-5">
                    {isEdit ? 'Chỉnh sửa Lịch trình' : 'Tạo Lịch trình mới'}
                </h3>
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
                            <p className="text-xs text-gray-500 mt-1">Hệ thống sẽ tự động tìm Tài xế và Xe dựa trên Route ID này.</p>
                        </div>

                        {/* 2. Input Ngày (Date) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="Date"
                                value={formData.Date ? new Date(formData.Date).toISOString().split('T')[0] : ''} 
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

                    {/* --- DROPDOWN TÀI XẾ (Đã cập nhật dùng API) --- */}
                    <div className="mb-4 col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chọn Tài xế <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="DriverID"
                            value={formData.DriverID}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white"
                        >
                            <option value="">-- Chọn Tài xế --</option>
                            {/* Render danh sách lấy từ API */}
                            {driverList.length > 0 ? (
                                driverList.map((driver: any) => (
                                    <option key={driver.DriverID} value={driver.DriverID}>
                                        {driver.FullName} (ID: {driver.DriverID})
                                    </option>
                                ))
                            ) : (
                                <option disabled>Đang tải danh sách...</option>
                            )}
                        </select>
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

const RunningScheduleCard = ({ schedule }: { schedule: Schedule }) => (
    <div className="p-5 rounded-xl shadow-lg border border-green-200 bg-white hover:shadow-xl transition duration-300 cursor-pointer relative overflow-hidden mb-3">
        <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-lg text-gray-900">{schedule.RouteName}</h4>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Live</span>
        </div>
        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1"><UserCheck className="w-4 h-4 text-green-500" /> Tài xế: <strong>{schedule.DriverName}</strong></p>
        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1"><Bus className="w-4 h-4 text-orange-500" /> Mã xe: <strong>{schedule.BusID}</strong></p>
    </div>
);

const ScheduleDetailModal = ({ isOpen, onClose, schedule }: { isOpen: boolean, onClose: () => void, schedule: Schedule | null }) => {
    if (!isOpen || !schedule) return null;

    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Info className="w-6 h-6 text-orange-500" /> Chi tiết Lịch trình</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
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
                        <p><span className="font-semibold text-gray-600">Ngày chạy:</span> <span className="font-medium text-gray-800">{new Date(schedule.Date).toLocaleDateString('vi-VN')}</span></p>
                        <p><span className="font-semibold text-gray-600">Giờ Bắt đầu:</span> <span className="font-medium text-green-600">{schedule.StartTime}</span></p>
                        <p><span className="font-semibold text-gray-600">Giờ Kết thúc:</span> <span className="font-medium text-red-600">{schedule.EndTime}</span></p>
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-md text-white ${PRIMARY_COLOR} ${PRIMARY_HOVER} transition shadow-md`}>Đóng</button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// ====================================================================
// 6. COMPONENT CHÍNH
// ====================================================================

export default function SchedulesPage() {
    const { schedules, loading, error, refetchSchedules, setSchedules } = useSchedules();
    const { handleSaveSchedule, handleDeleteSchedule } = useScheduleActions(refetchSchedules, setSchedules);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("Tất cả");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [mapCoordinates, setMapCoordinates] = useState<coordinates[]>([]);
    const [mapLoading, setMapLoading] = useState(false);
    const [routes, setRoutes] = useState<Routes>([]);
    
    // Modals state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    
    const [runningSchedules, setRunningSchedules] = useState<Schedule[]>([]);

    useEffect(() => {
        const filtered = schedules.filter(s => s.Status === 'IN_PROGRESS' || s.Status === 'Đang hoạt động');
        setRunningSchedules(filtered);
    }, [schedules]);

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

    const formatDate = (day: string) => {
        if (!day) return "";
        const date = new Date(day);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString('vi-VN');
    };

    // Filter Logic
    const filteredSchedules = schedules.filter(schedule => {
        const searchTermLower = String(searchTerm).toLowerCase();
        const matchesSearch =
            String(schedule.RouteName || '').toLowerCase().includes(searchTermLower) ||
            String(schedule.BusID || '').toLowerCase().includes(searchTermLower) ||
            String(schedule.DriverName || '').toLowerCase().includes(searchTermLower);

        // const matchesStatus = filterStatus === 'Tất cả' || schedule.Status === filterStatus; 
        // Logic status có thể cần điều chỉnh tùy dữ liệu trả về
        return matchesSearch; 
    });

    const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) setCurrentPage(page);
    };

    const handleOpenAddModal = () => { setSelectedSchedule(null); setShowFormModal(true); };
    const handleOpenEditModal = (schedule: Schedule, e: React.MouseEvent) => { e.stopPropagation(); setSelectedSchedule(schedule); setShowFormModal(true); };
    const handleOpenDetailModal = (schedule: Schedule, e: React.MouseEvent) => { e.stopPropagation(); setSelectedSchedule(schedule); setShowDetailModal(true); };
    const handleOpenDeleteModal = (schedule: Schedule, e: React.MouseEvent) => { e.stopPropagation(); handleDeleteSchedule(schedule); };

    if (loading && schedules.length === 0) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen w-full flex items-center justify-center">
                <div className="text-center text-gray-700">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-orange-500 mx-auto mb-3"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen w-full font-sans">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">📅 Quản lý Lịch trình</h1>
                    <p className="text-gray-500 text-base">Theo dõi trạng thái và vị trí các tuyến xe.</p>
                </div>
                <button onClick={handleOpenAddModal} className={`flex items-center gap-2 ${PRIMARY_COLOR} text-white px-6 py-3 rounded-xl shadow-md ${PRIMARY_HOVER} active:bg-orange-700`}>
                    <Plus className="w-5 h-5" /> Tạo Lịch trình
                </button>
            </div>

            {error && <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

            <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Tổng lịch trình" value={schedules.length.toString()} color="bg-orange-400" icon={Calendar} />
                <StatCard label="Đang hoạt động" value={runningSchedules.length.toString()} color="bg-green-500" icon={Bus} />
                <StatCard label="Dự kiến" value={schedules.filter(s => s.Status === 'NOT_STARTED').length.toString()} color="bg-blue-400" icon={Clock} />
                <StatCard label="Hoàn thành" value={schedules.filter(s => s.Status === 'COMPLETED').length.toString()} color="bg-gray-400" icon={CheckCircle} />
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="lg:w-2/3 h-[500px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
                     <h3 className="absolute z-10 top-4 left-4 text-sm font-bold bg-white/90 p-2 rounded shadow flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500"/> Giám sát Vị trí</h3>
                     <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        {/* Placeholder Map - Thay thế bằng MapView thật */}
                        {mapLoading ? <p>Đang tải map...</p> : <MapView coordinates={routes} />}
                     </div>
                </div>
                <div className="lg:w-1/3 max-h-[500px] overflow-y-auto">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 sticky top-0 bg-gray-50 py-2">Xe đang chạy ({runningSchedules.length})</h3>
                    {runningSchedules.length > 0 ? runningSchedules.map(s => <RunningScheduleCard key={s.ScheduleID} schedule={s} />) : <p className="text-gray-500">Không có xe nào đang chạy.</p>}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1">
                        <Filter className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Tìm kiếm theo tên tuyến, tài xế..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Tuyến</th>
                                <th className="px-6 py-3">Tài xế</th>
                                <th className="px-6 py-3 text-center">Biển số</th>
                                <th className="px-6 py-3">Thời gian</th>
                                <th className="px-6 py-3">Ngày</th>
                                <th className="px-6 py-3">Trạng thái</th>
                                <th className="px-6 py-3 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentSchedules.length > 0 ? currentSchedules.map((s) => (
                                <tr key={s.ScheduleID} className="hover:bg-orange-50 transition cursor-pointer" onClick={() => displayRouteOnMap(s)}>
                                    <td className="px-6 py-4 font-medium">#{s.ScheduleID}</td>
                                    <td className="px-6 py-4">{s.RouteName} <span className="text-xs text-gray-400 block">({s.RouteID})</span></td>
                                    <td className="px-6 py-4">{s.DriverName}</td>
                                    <td className="px-6 py-4 text-center font-mono">{s.BusID}</td>
                                    <td className="px-6 py-4">{s.StartTime} - {s.EndTime}</td>
                                    <td className="px-6 py-4">{formatDate(s.Date)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${s.Status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : s.Status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {s.Status || 'Chưa chạy'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                                        <button onClick={(e) => handleOpenDetailModal(s, e)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"><Eye className="w-4 h-4" /></button>
                                        <button onClick={(e) => handleOpenEditModal(s, e)} className="p-2 text-green-500 hover:bg-green-50 rounded-full"><Edit className="w-4 h-4" /></button>
                                        <button onClick={(e) => handleOpenDeleteModal(s, e)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan={8} className="text-center py-8 text-gray-500">Không tìm thấy lịch trình.</td></tr>}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Giữ nguyên logic cũ) */}
                <div className="p-4 flex items-center justify-between border-t border-gray-100">
                     <span className="text-gray-600">Trang {currentPage} / {totalPages || 1}</span>
                     <div className="flex gap-2">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                     </div>
                </div>
            </div>

            <ScheduleDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} schedule={selectedSchedule} />
            <ScheduleFormModal formatDate={formatDate} isOpen={showFormModal} onClose={() => setShowFormModal(false)} schedule={selectedSchedule} onSave={handleSaveSchedule} />
        </div>
    );
}