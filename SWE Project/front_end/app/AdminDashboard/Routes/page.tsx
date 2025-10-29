"use client";

import React, { useState, ReactElement, useEffect, FormEvent } from "react";
import { Users, Phone, Mail, MapPin, UserCircle, Search, Plus, Edit, Trash2, Eye, MessageSquare, Bell, BellOff, CheckCircle, XCircle, ChevronLeft, ChevronRight, Filter, Bus, School, Route as RouteIcon, UserCheck } from "lucide-react";
import './routes.css'
import MapView from "@/components/Layouts/MapView";

// Interface for a single bus stop (Kept for potential future use, though not used in form/API)
interface BusStop {
    id: number;
    name: string;
    time: string; // Estimated arrival time
}

// Interface for a bus route
interface Route {
    RouteID: number;
    RouteName: string;
    BusID: string;
    DriverID: string;
    StartLocation: string;
    EndLocation: string;
    DriverName: string;
    // Add 'status' here if the backend supports it, otherwise filtering by status won't work
}

// Interface for the form data
interface FormData {
    routeName: string;
    driverID: string;
    busID: string;
    startLocation: string;
    endLocation: string;
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
const API_BASE_URL = 'http://localhost:5000/routes'; // Centralize API URL

// Hàm khởi tạo form rỗng
interface coordinates {
    lng: number,
    lat: number
}

const initialFormData: FormData = {
    routeName: '',
    driverID: '',
    busID: '',
    startLocation: '',
    endLocation: ''
};
const routePoints = [
    [10.77653, 106.700981], // TP.HCM
    [11.9404, 108.4583],    // Đà Lạt
    [16.047079, 108.20623], // Đà Nẵng
    [21.0245, 105.84117],   // Hà Nội
];
// =================================================================
// ╔═╗┌─┐┬ ┬┌─┐┌┬┐┌─┐  Main Component
// ╚═╗├┤ │ │├─┘ │ ├┤
// ╚═╝└─┘└─┘┴  ┴ └─┘
// =================================================================

export default function RoutesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [coordinates, setCoordinates] = useState<coordinates[]>([]);
    const [mapError, setMapError] = useState('')
    const [mapLoading, setMapLoading] = useState(true)
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

    const [routes, setRoutes] = useState<Route[]>([]);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    console.log('mapLoading: ', mapLoading)
    console.log('mapError: ', mapError)
    // --- Data Fetching ---
    useEffect(() => {
        const fetchRoutesAndCoordinates = async () => {
            try {
                // --- Fetch routes ---
                const resRoutes = await fetch(API_BASE_URL);
                if (!resRoutes.ok) throw new Error("Lỗi fetch routes");
                const data = await resRoutes.json();
                if (!data?.routes?.length) return;

                setRoutes(data.routes);

                // --- Chọn route đầu tiên làm mặc định ---
                const firstRoute = data.routes[0];
                // --- Fetch coordinates của route đầu tiên ---
                setMapLoading(true);
                const resCoords = await fetch("http://localhost:5000/location/coordinates", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(firstRoute)
                });
                if (!resCoords.ok) throw new Error("Lỗi fetch coordinates");
                const coordData = await resCoords.json();
                setCoordinates(coordData.coordinates);
            } catch (err) {
                console.error(err);
                setMapError("Không thể tải dữ liệu");
            } finally {
                setMapLoading(false);
            }
        };

        fetchRoutesAndCoordinates();
    }, []);


    const itemsPerPage = 6;
    console.log('routes: ', routes)
    // --- Filtering Logic ---
    const filteredRoutes = routes.filter(route => {
        const searchTermLower = searchTerm.toLowerCase();
        // Check if route data is available before filtering
        if (routes.length === 0) return true;

        const matchesSearch = String(route.RouteName).toLowerCase().includes(searchTermLower) ||
            String(route.BusID).toLowerCase().includes(searchTermLower) ||
            String(route.DriverID).toLowerCase().includes(searchTermLower);

        const matchesDriver = advancedFilters.driverName === "" ||
            String(route.DriverID).toLowerCase().includes(advancedFilters.driverName.toLowerCase());

        const matchesBusNumber = advancedFilters.busNumber === "" ||
            String(route.BusID).toLowerCase().includes(advancedFilters.busNumber.toLowerCase());

        // Note: Status filtering is disabled as 'status' field is missing from Route interface/sample data
        // const matchesStatus = filterStatus === 'all' || (route as any).status === filterStatus;

        return matchesSearch && matchesDriver && matchesBusNumber; // && matchesStatus;
    });

    const routeLength = filteredRoutes.length;
    const totalPages = Math.ceil(routeLength / itemsPerPage);
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

    const closeAllModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteConfirm(false);
        setSelectedRoute(null);
        setRouteToDelete(null);
        setFormData(initialFormData);
    };

    // --- CRUD Handlers ---

    const handleAddRoute = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.routeName || !formData.startLocation || !formData.endLocation) {
            alert("Vui lòng điền đầy đủ thông tin tuyến đường!");
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/add`, {
                method: 'POST',
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify(formData)
            });
            console.log('res: ', response)
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setRoutes((prevRoutes) => [...prevRoutes, data.newRoute])
                }
                alert('Thêm tuyến xe thành công!');
                closeAllModals();
            } else {
                alert('Có lỗi xảy ra khi thêm tuyến.');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối hoặc hệ thống.');
        }
    };
    const displayRouteOnMap = async (route: any) => {
        console.log('kaka: ', route);
        setMapError('');
        setMapLoading(true);

        try {
            const response = await fetch('http://localhost:5000/location/coordinates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(route)
            });

            if (!response.ok) throw new Error('Lỗi server khi fetch tọa độ');

            const data = await response.json();

            if (!data?.coordinates?.length) throw new Error('Tọa độ trống');

            setCoordinates(data.coordinates);
            console.log('coorss: ', data.coordinates);
        } catch (err: any) {
            console.error(err);
            setMapError(err.message || 'Lỗi không lấy được dữ liệu');
        } finally {
            setMapLoading(false);
        }
    };

    const handleEditRoute = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedRoute || !formData.routeName || !formData.startLocation || !formData.endLocation) {
            alert('Vui lòng nhập đầy đủ các trường!');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/edit/${selectedRoute.RouteID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('đii: ', data.updatedRoute);
                if (data) {
                    setRoutes((prevRoute) =>
                        prevRoute.map((route) => route.RouteID.toString() === selectedRoute.RouteID.toString() ? data.updatedRoute : route)
                    )
                }
                alert('Cập nhật thông tin tuyến thành công!');
                closeAllModals();
            } else {
                alert('Có lỗi xảy ra khi cập nhật tuyến.');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối hoặc hệ thống.');
        }
    };

    const handleDeleteRoute = async (e: FormEvent) => {
        e.preventDefault();
        if (!routeToDelete) return;
        try {
            const response = await fetch(`${API_BASE_URL}/delete/${routeToDelete.RouteID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    const updatedRoutes = routes.filter((route) => route.RouteID != routeToDelete.RouteID);
                    setRoutes(updatedRoutes)
                };
                alert("Xóa tuyến xe thành công!");
                closeAllModals();
            } else {
                alert('Có lỗi xảy ra khi xóa tuyến.');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối hoặc hệ thống.');
        }
    };

    const openEditModal = (route: Route) => {
        setSelectedRoute(route);
        setFormData({
            routeName: route.RouteName,
            busID: route.BusID,
            driverID: route.DriverID,
            startLocation: route.StartLocation,
            endLocation: route.EndLocation
        });
        setShowEditModal(true);
    };

    // --- UI Helpers ---

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
        // Placeholder stats (will be meaningful if status field is added to Route)
        // { label: "Đang hoạt động", value: routes.filter(r => (r as any).status === "active").length.toString(), color: "bg-green-400", icon: CheckCircle },
        // { label: "Số xe buýt", value: new Set(routes.map(r => r.BusID)).size.toString(), color: "bg-blue-400", icon: Bus },
        // { label: "Tài xế", value: new Set(routes.map(r => r.DriverID)).size.toString(), color: "bg-purple-400", icon: UserCheck }
    ];

    // --- Render Components ---

    const ModalFormContent = (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
                <label className="text-sm text-gray-700 font-medium mb-1.5">Tên tuyến *</label>
                <input type="text" value={formData.routeName} onChange={(e) => setFormData({ ...formData, routeName: e.target.value })} className="p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="VD: Tuyến Quận 1 - Quận 3" />
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-700 font-medium mb-1.5">Mã xe *</label>
                <input type="text" value={formData.busID} onChange={(e) => setFormData({ ...formData, busID: e.target.value })} className="p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="VD: 51F-123.45" />
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-700 font-medium mb-1.5">Tài xế *</label>
                <input type="text" value={formData.driverID} onChange={(e) => setFormData({ ...formData, driverID: e.target.value })} className="p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="VD: DRV001" />
            </div>
            <div className="flex flex-col">
                <label className="text-sm text-gray-700 font-medium mb-1.5">Điểm bắt đầu *</label>
                <input type="text" value={formData.startLocation} onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })} className="p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="VD: Trường THPT A" />
            </div>
            {/* Thêm trường Điểm kết thúc bị thiếu */}
            <div className="flex flex-col">
                <label className="text-sm text-gray-700 font-medium mb-1.5">Điểm kết thúc *</label>
                <input type="text" value={formData.endLocation} onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })} className="p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="VD: Ký túc xá B" />
            </div>
        </div>
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý Tuyến xe</h1>
                    <p className="text-gray-500 text-base">Quản lý thông tin các tuyến xe buýt</p>
                </div>
                <button
                    onClick={() => { setShowAddModal(true); setFormData(initialFormData); }}
                    className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg border-none cursor-pointer font-medium transition duration-200 shadow-md hover:bg-orange-600 active:bg-orange-700"
                    style={{ backgroundColor: PRIMARY_COLOR, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    suppressHydrationWarning={true}
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
                                placeholder="Tìm kiếm theo tên tuyến, mã xe, mã tài xế..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200"
                                suppressHydrationWarning={true}
                                style={{
                                    '--tw-ring-color': PRIMARY_RING
                                } as React.CSSProperties}
                            />
                        </div>
                        <button
                            suppressHydrationWarning={true}
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
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Mã tài xế</label>
                                    <input
                                        type="text"
                                        placeholder="VD: DRV001"
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
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Mã xe</label>
                                    <input
                                        type="text"
                                        placeholder="VD: BUS001"
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
                            suppressHydrationWarning={true}
                            onClick={() => setFilterStatus('all')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'all' ? 'text-white bg-orange-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            style={filterStatus === 'all' ? { backgroundColor: PRIMARY_COLOR } : {}}
                        >
                            Tất cả
                        </button>
                        {/* Note: Status filters below are non-functional until 'status' is added to Route interface/data */}
                        <button
                            suppressHydrationWarning={true}
                            onClick={() => setFilterStatus('active')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Đang hoạt động
                        </button>
                        <button
                            suppressHydrationWarning={true}
                            onClick={() => setFilterStatus('inactive')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'inactive' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Tạm ngưng
                        </button>
                        <button
                            suppressHydrationWarning={true}
                            onClick={() => setFilterStatus('maintenance')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'maintenance' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Bảo trì
                        </button>
                    </div>
                </div>

                {/* Bản đồ Google */}
                <div className="lg:w-1/2 h-[450px] flex items-center justify-center">
                    {mapError ? (
                        <div className="flex flex-col items-center justify-center bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-md space-y-2 w-full h-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"
                                />
                            </svg>
                            <p className="text-lg font-medium text-center">{mapError}</p>
                            <p className="text-sm text-center text-red-600">Vui lòng thử lại sau</p>
                        </div>
                    ) : mapLoading ? (
                        <div className="flex flex-col items-center space-y-4 h-full justify-center">
                            <div className="w-16 h-16 border-4 border-[#FFAC50] border-t-transparent rounded-full animate-spin -mt-[5rem]"></div>
                            <p className="text-gray-700 text-lg font-medium">Đang lấy dữ liệu tuyến đường...</p>
                        </div>
                    ) : (
                        <MapView coordinates={coordinates} />
                    )}
                </div>

            </div>


            {/* Routes Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên tuyến</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã tuyến</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã xe</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">tài xế</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm bắt đầu</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm kết thúc</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRoutes.length > 0 ? (
                                currentRoutes.map((route) => (
                                    <tr onClick={() => { displayRouteOnMap(route) }} key={route.RouteID} className="border-b border-gray-100 transition duration-200 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 mb-0.5">{route.RouteName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">{route.RouteID}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">{route.BusID}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">{route.DriverName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">{route.StartLocation}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">{route.EndLocation}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => setSelectedRoute(route)} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-orange-50 text-orange-500" title="Xem chi tiết" style={{ color: PRIMARY_COLOR, backgroundColor: 'rgba(255, 172, 80, 0.1)' } as React.CSSProperties}><Eye className="w-4 h-4" /></button>
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
                    <div suppressHydrationWarning={true} className="flex justify-between items-center p-6 bg-white border-t border-gray-200 flex-wrap gap-4">
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
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{selectedRoute.RouteName}</h2>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRoute(null)} className="bg-transparent border-none text-gray-400 text-3xl cursor-pointer p-0 leading-none transition duration-200 hover:text-gray-700">×</button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin tuyến</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div><p className="text-sm text-gray-500 mb-1">Tên tuyến</p><p className="text-base text-gray-900 font-medium">{selectedRoute.RouteName}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">Mã tài xế</p><p className="text-base text-gray-900 font-medium">{selectedRoute.DriverID}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">Mã xe</p><p className="text-base text-gray-900 font-medium">{selectedRoute.BusID}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">Điểm bắt đầu</p><p className="text-base text-gray-900 font-medium">{selectedRoute.StartLocation}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">Điểm kết thúc</p><p className="text-base text-gray-900 font-medium">{selectedRoute.EndLocation}</p></div>
                                    {/* <div><p className="text-sm text-gray-500 mb-1">Trạng thái</p>{getStatusBadge(selectedRoute.status)}</div> */}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => openEditModal(selectedRoute)} className="flex-1 px-4 py-3 border-none rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 active:bg-green-800"><Edit className="w-4 h-4" /> Chỉnh sửa</button>
                                <button
                                    onClick={() => {
                                        setRouteToDelete(selectedRoute);
                                        setSelectedRoute(null);
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="flex-1 px-4 py-3 border-none rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
                                >
                                    <Trash2 className="w-4 h-4" /> Xóa tuyến
                                </button>
                                <button
                                    onClick={() => setSelectedRoute(null)}
                                    className="flex-1 px-4 py-3 border rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal (Sử dụng ModalFormContent đã refactor) */}
            {(showAddModal || showEditModal) && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-gray-900">{showAddModal ? 'Thêm tuyến mới' : 'Chỉnh sửa thông tin tuyến'}</h2>
                            <button onClick={closeAllModals} className="bg-transparent border-none text-gray-400 text-3xl cursor-pointer p-0 leading-none transition duration-200 hover:text-gray-700">×</button>
                        </div>
                        <form onSubmit={showAddModal ? handleAddRoute : handleEditRoute}>
                            <div className="p-6">
                                {ModalFormContent}
                                <div className="flex gap-3 pt-4 flex-col sm:flex-row">
                                    <button type="button" onClick={closeAllModals} className="flex-1 px-4 py-3 border-none rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200">Hủy</button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 transition duration-200"
                                        style={{ backgroundColor: PRIMARY_COLOR, hover: PRIMARY_HOVER } as React.CSSProperties}
                                    >
                                        {showAddModal ? 'Thêm' : 'Cập nhật'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && routeToDelete && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-gray-900">Xác nhận xóa</h2>
                            <button onClick={closeAllModals} className="bg-transparent border-none text-gray-400 text-3xl cursor-pointer p-0 leading-none transition duration-200 hover:text-gray-700">×</button>
                        </div>
                        <form onSubmit={handleDeleteRoute}>
                            <div className="p-6">
                                <p className="text-gray-500 mb-3 text-base leading-relaxed">Bạn có chắc chắn muốn xóa tuyến **{routeToDelete.RouteName}**?</p>
                                <p className="text-sm font-semibold p-3 rounded-lg border border-red-300 bg-red-100 text-red-600">Hành động này không thể hoàn tác!</p>
                                <div className="flex gap-3 pt-4 flex-col sm:flex-row">
                                    <button type="button" onClick={closeAllModals} className="flex-1 px-4 py-3 border-none rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200">Hủy</button>
                                    <button type="submit" className="flex-1 px-4 py-3 border-none rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 active:bg-red-800">Xóa</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}