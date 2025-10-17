"use client";

import React, { useState, ReactElement } from "react";
import { Users, Phone, Mail, MapPin, UserCircle, Search, Plus, Edit, Trash2, Eye, MessageSquare, Bell, BellOff, CheckCircle, XCircle, ChevronLeft, ChevronRight, Filter, Bus, School, Route as RouteIcon, UserCheck } from "lucide-react";
import './routes.css'
// Interface for a single bus stop
interface BusStop {
    id: number;
    name: string;
    time: string; // Estimated arrival time
}

// Interface for a bus route
interface Route {
    id: number;
    name: string;
    busNumber: string;
    driverName: string;
    driverPhone: string;
    stops: BusStop[];
    status: string; // e.g., 'active', 'inactive', 'maintenance'
    registeredDate: string;
    avatar: string;
}

// Interface for the form data
interface FormData {
    name: string;
    busNumber: string;
    driverName: string;
    driverPhone: string;
}

// Interface for advanced filters
interface AdvancedFilters {
    driverName: string;
    busNumber: string;
    status: string;
}

// --- Màu sắc tùy chỉnh (Orange-Yellow: #FFAC50, Dark Hover: #E59B48) ---
const PRIMARY_COLOR = "#FFAC50";
const PRIMARY_HOVER = "#E59B48";
const PRIMARY_RING = "rgba(255, 172, 80, 0.3)";

export default function RoutesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
        driverName: "",
        busNumber: "",
        status: ""
    });

    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);

    // Sample data for bus routes
    const [routes, setRoutes] = useState<Route[]>([
        {
            id: 1,
            name: "Tuyến Quận 1 - Quận 3",
            busNumber: "51F-123.45",
            driverName: "Nguyễn Văn A",
            driverPhone: "0901112233",
            stops: [
                { id: 1, name: "Chợ Bến Thành", time: "06:30" },
                { id: 2, name: "Dinh Độc Lập", time: "06:45" },
                { id: 3, name: "Hồ Con Rùa", time: "07:00" },
            ],
            status: "active",
            registeredDate: "01/01/2024",
            avatar: "T1"
        },
        {
            id: 2,
            name: "Tuyến Gò Vấp - Bình Thạnh",
            busNumber: "51G-678.90",
            driverName: "Trần Thị B",
            driverPhone: "0912223344",
            stops: [
                { id: 1, name: "Vincom Quang Trung", time: "06:15" },
                { id: 2, name: "Đại học Công Nghiệp", time: "06:35" },
                { id: 3, name: "Bến xe Miền Đông", time: "07:10" },
            ],
            status: "active",
            registeredDate: "15/01/2024",
            avatar: "T2"
        },
        {
            id: 3,
            name: "Tuyến Sân Bay",
            busNumber: "51A-112.23",
            driverName: "Lê Văn C",
            driverPhone: "0923334455",
            stops: [
                { id: 1, name: "Ga Quốc Nội", time: "07:00" },
                { id: 2, name: "Công viên Hoàng Văn Thụ", time: "07:20" },
            ],
            status: "maintenance",
            registeredDate: "10/02/2024",
            avatar: "S"
        },
        {
            id: 4,
            name: "Tuyến Quận 7",
            busNumber: "51H-555.44",
            driverName: "Phạm Thị D",
            driverPhone: "0934445566",
            stops: [
                { id: 1, name: "SC VivoCity", time: "06:40" },
                { id: 2, name: "Đại học RMIT", time: "06:55" },
                { id: 3, name: "Crescent Mall", time: "07:15" },
            ],
            status: "inactive",
            registeredDate: "05/03/2024",
            avatar: "T7"
        },
    ]);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        busNumber: "",
        driverName: "",
        driverPhone: ""
    });

    const itemsPerPage = 6;

    // Filter logic for routes
    const filteredRoutes = routes.filter(route => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = route.name.toLowerCase().includes(searchTermLower) ||
            route.busNumber.toLowerCase().includes(searchTermLower) ||
            route.driverName.toLowerCase().includes(searchTermLower);

        const matchesDriver = advancedFilters.driverName === "" ||
            route.driverName.toLowerCase().includes(advancedFilters.driverName.toLowerCase());

        const matchesBusNumber = advancedFilters.busNumber === "" ||
            route.busNumber.toLowerCase().includes(advancedFilters.busNumber.toLowerCase());

        const matchesStatus = filterStatus === "all" || route.status === filterStatus;

        return matchesSearch && matchesDriver && matchesBusNumber && matchesStatus;
    });

    const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRoutes = filteredRoutes.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const clearAdvancedFilters = () => {
        setAdvancedFilters({
            driverName: "",
            busNumber: "",
            status: ""
        });
    };

    const handleAddRoute = () => {
        if (!formData.name || !formData.busNumber || !formData.driverName || !formData.driverPhone) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        const newRoute: Route = {
            id: routes.length + 1,
            ...formData,
            stops: [], // Add logic to add stops if needed
            status: "active",
            registeredDate: new Date().toLocaleDateString('vi-VN'),
            avatar: formData.name.substring(0, 2).toUpperCase()
        };

        setRoutes([...routes, newRoute]);
        setShowAddModal(false);
        setFormData({ name: "", busNumber: "", driverName: "", driverPhone: "" });
        alert("Thêm tuyến xe thành công!");
    };

    const handleEditRoute = () => {
        if (!selectedRoute) return;

        const updatedRoutes = routes.map(r =>
            r.id === selectedRoute.id ? {
                ...selectedRoute,
                ...formData
            } : r
        );

        setRoutes(updatedRoutes);
        setShowEditModal(false);
        setSelectedRoute(null);
        setFormData({ name: "", busNumber: "", driverName: "", driverPhone: "" });
        alert("Cập nhật thông tin tuyến thành công!");
    };

    const handleDeleteRoute = () => {
        if (!routeToDelete) return;

        setRoutes(routes.filter(r => r.id !== routeToDelete.id));
        setShowDeleteConfirm(false);
        setRouteToDelete(null);
        alert("Xóa tuyến xe thành công!");
    };

    const openEditModal = (route: Route) => {
        setSelectedRoute(route);
        setFormData({
            name: route.name,
            busNumber: route.busNumber,
            driverName: route.driverName,
            driverPhone: route.driverPhone,
        });
        setShowEditModal(true);
    };

    const getStatusBadge = (status: string): ReactElement => {
        switch (status) {
            case "active":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3.5 h-3.5" /> Đang hoạt động</span>;
            case "inactive":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><XCircle className="w-3.5 h-3.5" /> Tạm ngưng</span>;
            case "maintenance":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"><Users className="w-3.5 h-3.5" /> Đang bảo trì</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Không rõ</span>;
        }
    };

    const stats = [
        { label: "Tổng số tuyến", value: routes.length.toString(), color: "bg-orange-400", icon: RouteIcon },
        { label: "Đang hoạt động", value: routes.filter(r => r.status === "active").length.toString(), color: "bg-orange-400", icon: CheckCircle },
        { label: "Số xe buýt", value: new Set(routes.map(r => r.busNumber)).size.toString(), color: "bg-orange-400", icon: Bus },
        { label: "Tài xế", value: new Set(routes.map(r => r.driverName)).size.toString(), color: "bg-orange-400", icon: UserCheck }
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý Tuyến xe</h1>
                    <p className="text-gray-500 text-base">Quản lý thông tin các tuyến xe buýt</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg border-none cursor-pointer font-medium transition duration-200 shadow-md hover:bg-orange-600 active:bg-orange-700"
                    style={{ backgroundColor: PRIMARY_COLOR, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                >
                    <Plus className="w-5 h-5" />
                    Thêm tuyến mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters and Search - Divided Layout */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                {/* Bộ lọc bên trái */}
                <div className="bg-white rounded-xl p-6 shadow-md lg:w-1/2">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1 min-w-[250px] relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên tuyến, biển số xe, tên tài xế..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200"
                                style={{
                                    '--tw-ring-color': PRIMARY_RING // Custom ring color for consistency
                                } as React.CSSProperties}
                            />
                        </div>
                        <button
                            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${showAdvancedSearch ? 'text-white bg-orange-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            style={showAdvancedSearch ? { backgroundColor: PRIMARY_COLOR } : {}}
                        >
                            <Filter className="w-4 h-4" />
                            Tìm kiếm nâng cao
                        </button>
                    </div>

                    {showAdvancedSearch && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2">
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Tên tài xế</label>
                                    <input
                                        type="text"
                                        placeholder="VD: Nguyễn Văn A"
                                        value={advancedFilters.driverName}
                                        onChange={(e) =>
                                            setAdvancedFilters({
                                                ...advancedFilters,
                                                driverName: e.target.value,
                                            })
                                        }
                                        className="p-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Biển số xe</label>
                                    <input
                                        type="text"
                                        placeholder="VD: 51F-123.45"
                                        value={advancedFilters.busNumber}
                                        onChange={(e) =>
                                            setAdvancedFilters({
                                                ...advancedFilters,
                                                busNumber: e.target.value,
                                            })
                                        }
                                        className="p-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                    />
                                </div>
                            </div>
                            <button onClick={clearAdvancedFilters} className="px-5 py-2.5 rounded-lg border-none font-medium cursor-pointer transition duration-200 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2 flex-wrap mt-4">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'all' ? 'text-white bg-orange-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            style={filterStatus === 'all' ? { backgroundColor: PRIMARY_COLOR } : {}}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đang hoạt động
                        </button>
                        <button
                            onClick={() => setFilterStatus('inactive')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'inactive' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Tạm ngưng
                        </button>
                        <button
                            onClick={() => setFilterStatus('maintenance')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'maintenance' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Bảo trì
                        </button>
                    </div>
                </div>

                {/* Bản đồ Google */}
                <div className="lg:w-1/2 h-[450px]">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3393.984795413037!2d106.67968337428745!3d10.759922359499473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1b7c3ed289%3A0xa06651894598e488!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBTw6BpIEfDsm4!5e1!3m2!1svi!2s!4v1760436694225!5m2!1svi!2s"
                        width="100%"
                        height="100%"
                        className="rounded-xl shadow-md border-none"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Map Placeholder"
                    ></iframe>
                </div>
            </div>


            {/* Routes Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên tuyến</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Xe buýt</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tài xế</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Số điểm dừng</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRoutes.length > 0 ? (
                                currentRoutes.map((route) => (
                                    <tr key={route.id} className="border-b border-gray-100 transition duration-200 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-base" style={{ backgroundColor: PRIMARY_COLOR }}>{route.avatar}</div>
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 mb-0.5">{route.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <Bus className="w-4 h-4 text-gray-400" />
                                                    {route.busNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <UserCircle className="w-4 h-4 text-gray-400" />
                                                    {route.driverName}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    {route.driverPhone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 whitespace-nowrap">{route.stops.length} điểm</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 whitespace-nowrap">{route.registeredDate}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(route.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => setSelectedRoute(route)} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-orange-50 text-orange-500" title="Xem chi tiết" style={{ color: PRIMARY_COLOR, '--tw-bg-opacity': 0.1 } as React.CSSProperties}><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => openEditModal(route)} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-green-100 text-green-600" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => { setRouteToDelete(route); setShowDeleteConfirm(true); }} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-red-100 text-red-600" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center p-12 text-gray-500">Không tìm thấy tuyến xe nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredRoutes.length > 0 && (
                    <div className="flex justify-between items-center p-6 bg-white border-t border-gray-200 flex-wrap gap-4">
                        <div className="text-gray-500 text-sm">
                            Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredRoutes.length)} trong tổng số {filteredRoutes.length} tuyến
                        </div>
                        <div className="flex gap-2 items-center">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2.5 border border-gray-300 bg-white rounded-md cursor-pointer transition duration-200 text-sm min-w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-orange-500"><ChevronLeft className="w-4 h-4" /></button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-3 py-2 border rounded-md cursor-pointer transition duration-200 text-sm font-medium min-w-10 ${currentPage === index + 1 ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-orange-500'}`}
                                    style={currentPage === index + 1 ? { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR } : {}}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2.5 border border-gray-300 bg-white rounded-md cursor-pointer transition duration-200 text-sm min-w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-orange-500"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Route Detail Modal */}
            {selectedRoute && !showEditModal && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ backgroundColor: PRIMARY_COLOR }}>{selectedRoute.avatar}</div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{selectedRoute.name}</h2>
                                    <p className="text-gray-500 text-sm">Ngày tạo: {selectedRoute.registeredDate}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRoute(null)} className="bg-transparent border-none text-gray-400 text-3xl cursor-pointer p-0 leading-none transition duration-200 hover:text-gray-700">×</button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin tuyến</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div><p className="text-sm text-gray-500 mb-1">Biển số xe</p><p className="text-base text-gray-900 font-medium">{selectedRoute.busNumber}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">Tên tài xế</p><p className="text-base text-gray-900 font-medium">{selectedRoute.driverName}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">SĐT Tài xế</p><p className="text-base text-gray-900 font-medium">{selectedRoute.driverPhone}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">Trạng thái</p>{getStatusBadge(selectedRoute.status)}</div>
                                </div>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Danh sách điểm dừng ({selectedRoute.stops.length})</h3>
                                <div className="flex flex-col gap-3">
                                    {selectedRoute.stops.map((stop) => (
                                        <div key={stop.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div><p className="text-base text-gray-900 font-semibold mb-0.5">{stop.name}</p></div>
                                                <div className="flex-shrink-0 text-left sm:text-right">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Giờ đón</p>
                                                    <p className="text-sm text-gray-900 font-semibold">{stop.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedRoute.stops.length === 0 && <p className="text-gray-500">Chưa có điểm dừng nào được thêm.</p>}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => openEditModal(selectedRoute)} className="flex-1 px-4 py-3 border-none rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 active:bg-green-800"><Edit className="w-4.5 h-4.5" />Chỉnh sửa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-gray-900">{showAddModal ? 'Thêm tuyến mới' : 'Chỉnh sửa thông tin tuyến'}</h2>
                            <button onClick={() => { showAddModal ? setShowAddModal(false) : setShowEditModal(false); setFormData({ name: "", busNumber: "", driverName: "", driverPhone: "" }); setSelectedRoute(null); }} className="bg-transparent border-none text-gray-400 text-3xl cursor-pointer p-0 leading-none transition duration-200 hover:text-gray-700">×</button>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col"><label className="text-sm text-gray-700 font-medium mb-1.5">Tên tuyến *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="VD: Tuyến Quận 1 - Quận 3" /></div>
                                <div className="flex flex-col"><label className="text-sm text-gray-700 font-medium mb-1.5">Biển số xe *</label><input type="text" value={formData.busNumber} onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })} className="p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="VD: 51F-123.45" /></div>
                                <div className="flex flex-col"><label className="text-sm text-gray-700 font-medium mb-1.5">Tên tài xế *</label><input type="text" value={formData.driverName} onChange={(e) => setFormData({ ...formData, driverName: e.target.value })} className="p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="VD: Nguyễn Văn A" /></div>
                                <div className="flex flex-col"><label className="text-sm text-gray-700 font-medium mb-1.5">SĐT Tài xế *</label><input type="text" value={formData.driverPhone} onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })} className="p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="VD: 0901234567" /></div>
                            </div>
                            <div className="flex gap-3 pt-4 flex-col sm:flex-row">
                                <button onClick={() => { showAddModal ? setShowAddModal(false) : setShowEditModal(false); setFormData({ name: "", busNumber: "", driverName: "", driverPhone: "" }); setSelectedRoute(null); }} className="flex-1 px-4 py-3 border-none rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200">Hủy</button>
                                <button
                                    onClick={showAddModal ? handleAddRoute : handleEditRoute}
                                    className="flex-1 px-4 py-3 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 transition duration-200"
                                >
                                    {showAddModal ? 'Thêm' : 'Cập nhật'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && routeToDelete && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-gray-900">Xác nhận xóa</h2>
                            <button onClick={() => { setShowDeleteConfirm(false); setRouteToDelete(null); }} className="bg-transparent border-none text-gray-400 text-3xl cursor-pointer p-0 leading-none transition duration-200 hover:text-gray-700">×</button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-500 mb-3 text-base leading-relaxed">Bạn có chắc chắn muốn xóa tuyến **{routeToDelete.name}**?</p>
                            <p className="text-sm font-semibold p-3 rounded-lg border border-red-300 bg-red-100 text-red-600">Hành động này không thể hoàn tác!</p>
                            <div className="flex gap-3 pt-4 flex-col sm:flex-row">
                                <button onClick={() => { setShowDeleteConfirm(false); setRouteToDelete(null); }} className="flex-1 px-4 py-3 border-none rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200">Hủy</button>
                                <button onClick={handleDeleteRoute} className="flex-1 px-4 py-3 border-none rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 active:bg-red-800">Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}