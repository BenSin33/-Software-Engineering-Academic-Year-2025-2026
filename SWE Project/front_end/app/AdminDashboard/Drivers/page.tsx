"use client";

import { useState, useMemo, useEffect } from "react";
import {
  UserCircle, Phone, Mail, CheckCircle, Clock, Search,
  Plus, Edit, Trash2, Eye, Filter, ChevronLeft, ChevronRight,
  X, AlertTriangle, MessageSquare
} from "lucide-react";
import "./DriversPage.css";
import MessagePanel from "@/components/Driver/MessagePanel";
import { fetchAllBuses } from "@/app/API/busService";
import { fetchRouteService } from "@/app/API/routeService";
import MessagePanelToDriver from "@/components/Admin/MessagePanelToDriver";
import { userIdToMessageId } from "@/utils/idConverter";

interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  busId: string;
  busName: string;
  routeId: string;
  routeName: string;
  status: "active" | "rest";
  avatar: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  status: "active" | "rest";
  bus: string;
  route: string;
}

interface ApiDriver {
  DriverID: string;
  UserID: string;
  FullName: string;
  PhoneNumber: string;
  Email: string;
  Status: "active" | "rest";
}

interface ApiBus {
  BusID: string;
  RouteID: string | null;
  DriverID: string | null;
  [key: string]: any; // Allow other properties for loose casing check
}

interface ApiDriverStats {
  total: number;
  active: number;
  rest: number;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "rest">("all");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);

  // 🔧 State cho MessagePanel
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [messageDriver, setMessageDriver] = useState<Driver | null>(null);

  const [driverStats, setDriverStats] = useState<ApiDriverStats>({ total: 0, active: 0, rest: 0 });
  const [busList, setBusList] = useState<any[]>([]);
  const [routeList, setRouteList] = useState<any[]>([]);

  const initialFormData: FormData = {
    name: "",
    phone: "",
    email: "",
    status: "active",
    bus: "",
    route: "",
  };
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [advancedFilters, setAdvancedFilters] = useState({
    name: "",
    phone: "",
    email: "",
    bus: "",
    route: "",
  });

  const itemsPerPage = 5;
  const API_URL = "http://localhost:5000/api/drivers";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, driversRes, busesRes, routesData] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}?limit=1000`),
        fetch(`http://localhost:5000/api/buses?limit=1000`),
        fetchRouteService()
      ]);

      if (!statsRes.ok) throw new Error("Không thể tải thống kê tài xế");
      if (!driversRes.ok) throw new Error("Không thể tải danh sách tài xế");
      if (!busesRes.ok) throw new Error("Không thể tải danh sách xe");

      const statsData = await statsRes.json();
      const driversData = await driversRes.json();
      const busesData = await busesRes.json();
      // const routesData = routesRes; // Removed, already destructured

      // 👉 Log để kiểm tra dữ liệu thực tế
      console.log("Stats data:", statsData);
      console.log("Drivers data:", driversData);
      console.log("Buses data:", busesData);

      if (statsData.success) {
        setDriverStats(statsData.data);
      }

      if (driversData.success && busesData.success) {
        console.log("DEBUG: Drivers Data Sample:", driversData.data.slice(0, 3));
        console.log("DEBUG: Buses Data Sample:", busesData.data.slice(0, 3));
        if (routesData?.routes) {
          console.log("DEBUG: Routes Data Sample:", routesData.routes.slice(0, 3));
        }

        // 1. Create Bus Map (ID -> { Plate, RouteID })
        const busDetailsMap = new Map<string, { id: string; plate: string; routeId: string }>();
        // Also keep the assignment map
        const busAssignmentMap = new Map<string, { busId: string; routeId: string }>();

        if (Array.isArray(busesData.data)) {
          busesData.data.forEach((bus: ApiBus) => {
            const bId = bus.BusID || bus.busID || bus.busId;
            const rId = bus.RouteID || bus.routeID || bus.routeId;
            const plate = bus.PlateNumber || bus.plateNumber || bId; // Fallback to ID if no plate

            if (bId) {
              busDetailsMap.set(String(bId).toLowerCase(), { id: bId, plate, routeId: rId });
            }

            // Handle driver assignment
            let driverId = bus.DriverID || bus.driverID || bus.driverId;
            if (driverId) {
              driverId = String(driverId);
              busAssignmentMap.set(driverId.toLowerCase(), {
                busId: bId,
                routeId: rId || "N/A"
              });
            }
          });
        }
        console.log("DEBUG: Bus Assignment Map Keys:", Array.from(busAssignmentMap.keys()));

        // 2. Create Route Map (ID -> Name)
        const routeDetailsMap = new Map<string, string>();
        if (routesData && Array.isArray(routesData.routes)) {
          routesData.routes.forEach((route: any) => {
            const rId = route.RouteID || route.routeID;
            const rName = route.RouteName || route.routeName;
            if (rId) {
              routeDetailsMap.set(String(rId).toLowerCase(), rName);
            }
          });
        }

        const mappedDrivers = driversData.data.map((driver: any): Driver => {
          // Case-insensitive lookup in busAssignmentMap
          let assignedBus = busAssignmentMap.get(String(driver.DriverID).toLowerCase());

          // Determine Bus ID and Route ID
          // Priority: Assigned via Bus Service > Assigned via Driver Service
          const busId = assignedBus ? assignedBus.busId : (driver.BusID || driver.busID || "");
          const routeId = assignedBus ? assignedBus.routeId : (driver.RouteID || driver.routeID || "");

          // Resolve Names
          const busInfo = busDetailsMap.get(String(busId).toLowerCase());
          const busName = busInfo ? busInfo.id : (busId || "-");

          // If routeId is missing from assignment, try to get it from the bus info
          const finalRouteId = routeId || (busInfo ? busInfo.routeId : "");
          const routeName = routeDetailsMap.get(String(finalRouteId).toLowerCase()) || finalRouteId || "-";

          // Convert database status to frontend format
          const status = driver.Status?.toLowerCase() === "active" ? "active" : "rest";
          const fullName = driver.FullName || driver.fullName || "Unknown";
          const phoneNumber = driver.PhoneNumber || driver.phone || "";
          const email = driver.Email || driver.email || "";

          return {
            id: driver.DriverID,
            userId: driver.UserID,
            name: fullName,
            phone: phoneNumber,
            email: email,
            status: status,
            busId: busId || "",
            busName: busName,
            routeId: finalRouteId || "",
            routeName: routeName,
            avatar: fullName !== "Unknown" ? fullName.charAt(0).toUpperCase() : "?"
          };
        });

        setDrivers(mappedDrivers);
      } else {
        throw new Error(driversData.message || busesData.message || "Lỗi tải dữ liệu");
      }
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const busData = await fetchAllBuses();
        setBusList(busData);
        const routes = await fetchRouteService();
        setRouteList(routes?.routes || []);
      } catch (error) {
        console.error("Lỗi tải bus hoặc route:", error);
      }
    })();
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      const matchesBasicSearch =
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "all" || driver.status === filterStatus;

      const matchesName = !advancedFilters.name ||
        driver.name.toLowerCase().includes(advancedFilters.name.toLowerCase());
      const matchesPhone = !advancedFilters.phone ||
        driver.phone.includes(advancedFilters.phone);
      const matchesEmail = !advancedFilters.email ||
        driver.email.toLowerCase().includes(advancedFilters.email.toLowerCase());
      const matchesBus = !advancedFilters.bus ||
        driver.busName.toLowerCase().includes(advancedFilters.bus.toLowerCase());
      const matchesRoute = !advancedFilters.route ||
        driver.routeName.toLowerCase().includes(advancedFilters.route.toLowerCase());

      return matchesBasicSearch && matchesStatus && matchesName &&
        matchesPhone && matchesEmail && matchesBus && matchesRoute;
    });
  }, [searchTerm, filterStatus, advancedFilters, drivers]);

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDrivers = filteredDrivers.slice(startIndex, endIndex);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, advancedFilters]);

  const stats = useMemo(() => {
    return [
      { label: "Tổng số tài xế", value: driverStats.total.toString(), color: "bg-blue-500", icon: UserCircle },
      { label: "Đang hoạt động", value: driverStats.active.toString(), color: "bg-green-500", icon: CheckCircle },
      { label: "Đang nghỉ", value: driverStats.rest.toString(), color: "bg-yellow-500", icon: Clock },
    ];
  }, [driverStats]);

  const handleAdvancedSearch = () => {
    setCurrentPage(1);
  };

  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      name: "",
      phone: "",
      email: "",
      bus: "",
      route: "",
    });
    setCurrentPage(1);
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleAddDriver = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      alert("Vui lòng điền đủ các trường bắt buộc!");
      return;
    }

    // ✅ Validate phone number - only digits, no special characters
    if (!/^\d+$/.test(formData.phone)) {
      alert("Số điện thoại chỉ được chứa các chữ số, không được chứa ký tự đặc biệt!");
      return;
    }

    const newDriverData = {
      fullName: formData.name,
      phoneNumber: formData.phone,
      email: formData.email,
      status: formData.status,
    };

    try {
      // 1. Create Driver (User Service -> Syncs to Bus Service)
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDriverData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Lỗi khi thêm tài xế");
      }

      const newDriverId = result.data?.driverId;

      // 2. Assign Bus (if selected)
      if (newDriverId && formData.bus) {
        try {
          await fetch(`http://localhost:5000/api/buses/${formData.bus}/driver`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverId: newDriverId })
          });

          if (formData.route) {
            await fetch(`http://localhost:5000/api/buses/${formData.bus}/route`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ routeId: formData.route })
            });
          }
        } catch (assignErr) {
          console.error("Failed to assign bus/route:", assignErr);
          alert("Tạo tài xế thành công nhưng lỗi khi gán xe/tuyến. Vui lòng cập nhật lại.");
        }
      }

      alert("Thêm tài xế thành công!");
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
      console.error(err);
    }
  };

  const handleEditClick = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      status: driver.status,
      bus: driver.busId,
      route: driver.routeId,
    });
    setShowEditModal(true);
  };

  // 🔧 Mở MessagePanel thay vì modal cũ
  const handleOpenMessagePanel = (driver: Driver) => {
    setMessageDriver(driver);
    setShowMessagePanel(true);
  };

  const handleUpdateDriver = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    if (!editingDriver) return;

    // ✅ Validate phone number - only digits, no special characters
    if (!/^\d+$/.test(formData.phone)) {
      alert("Số điện thoại chỉ được chứa các chữ số, không được chứa ký tự đặc biệt!");
      return;
    }

    const updatedData = {
      fullName: formData.name,
      phoneNumber: formData.phone,
      email: formData.email,
      status: formData.status,
    };

    try {
      const response = await fetch(`${API_URL}/${editingDriver.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Lỗi khi cập nhật");
      }

      if (editingDriver.status !== formData.status) {
        await fetch(`${API_URL}/${editingDriver.id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: formData.status }),
        });
      }

      // Assign Bus if changed
      if (formData.bus && formData.bus !== editingDriver.busId) {
        try {
          await fetch(`http://localhost:5000/api/buses/${formData.bus}/driver`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverId: editingDriver.id })
          });

          if (formData.route) {
            await fetch(`http://localhost:5000/api/buses/${formData.bus}/route`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ routeId: formData.route })
            });
          }
        } catch (assignErr) {
          console.error("Failed to update bus assignment:", assignErr);
        }
      }

      alert("Cập nhật thông tin tài xế thành công!");
      setShowEditModal(false);
      setEditingDriver(null);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
      console.error(err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingDriverId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingDriverId !== null) {
      try {
        const response = await fetch(`${API_URL}/${deletingDriverId}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 400 && result.message) {
            throw new Error(result.message);
          }
          throw new Error(result.message || "Lỗi khi xóa tài xế");
        }

        alert("Xóa tài xế thành công!");
        setShowDeleteConfirm(false);
        setDeletingDriverId(null);
        fetchData();
      } catch (err: any) {
        alert(`Lỗi: ${err.message}`);
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status: Driver["status"]) => {
    return status === "active" ? (
      <span className="statusBadge statusActive">
        Đang hoạt động
      </span>
    ) : (
      <span className="statusBadge statusRest">
        Đang nghỉ
      </span>
    );
  };

  return (
    <div className="driversContainer">
      {/* Header */}
      <div className="header">
        <div className="headerContent">
          <h1>Quản lý Tài xế</h1>
          <p>Quản lý thông tin và lịch làm việc của tài xế</p>
        </div>
        <button className="addButton" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-5 h-5" />
          Thêm tài xế mới
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          padding: "1rem",
          borderRadius: "0.5rem",
          marginBottom: "1.5rem"
        }}>
          <strong>Lỗi tải dữ liệu:</strong> {error}
        </div>
      )}

      {/* Stats */}
      <div className="statsGrid">
        {stats.map((stat, index) => (
          <div key={index} className="statCard">
            <div className="statContent">
              <p>{stat.label}</p>
              <p>{loading ? "..." : stat.value}</p>
            </div>
            <div className={`statIcon ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Search Section */}
      <div className="searchSection">
        <div className="searchRow">
          <div className="searchInputWrapper">
            <Search className="searchIcon w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh theo tên, số điện thoại, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="searchInput"
            />
          </div>

          <button
            className="advancedSearchToggle"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          >
            <Filter className="w-4 h-4" />
            {showAdvancedSearch ? "Ẩn tìm kiếm nâng cao" : "Tìm kiếm nâng cao"}
          </button>
        </div>

        <div className="filterButtons">
          <button
            onClick={() => setFilterStatus("all")}
            className={`filterButton ${filterStatus === "all" ? "active bg-blue-600" : "inactive"
              }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`filterButton ${filterStatus === "active" ? "active bg-green-600" : "inactive"
              }`}
          >
            Hoạt động
          </button>
          <button
            onClick={() => setFilterStatus("rest")}
            className={`filterButton ${filterStatus === "rest" ? "active bg-yellow-600" : "inactive"
              }`}
          >
            Nghỉ
          </button>
        </div>

        {showAdvancedSearch && (
          <div className="advancedSearchPanel">
            <div className="advancedSearchGrid">
              <div className="formGroup">
                <label>Tên tài xế</label>
                <input
                  type="text"
                  placeholder="Nhập tên..."
                  value={advancedFilters.name}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, name: e.target.value })}
                />
              </div>
              <div className="formGroup">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại..."
                  value={advancedFilters.phone}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, phone: e.target.value })}
                />
              </div>
              <div className="formGroup">
                <label>Email</label>
                <input
                  type="text"
                  placeholder="Nhập email..."
                  value={advancedFilters.email}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, email: e.target.value })}
                />
              </div>
              <div className="formGroup">
                <label>Xe buýt</label>
                <input
                  type="text"
                  placeholder="VD: BUS-01"
                  value={advancedFilters.bus}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, bus: e.target.value })}
                />
              </div>
              <div className="formGroup">
                <label>Tuyến đường</label>
                <input
                  type="text"
                  placeholder="VD: ROUTE-01"
                  value={advancedFilters.route}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, route: e.target.value })}
                />
              </div>
            </div>
            <div className="advancedSearchActions">
              <button
                className="resetButton"
                onClick={resetAdvancedFilters}
              >
                Xóa bộ lọc
              </button>
              <button
                className="searchButton"
                onClick={handleAdvancedSearch}
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drivers Table */}
      <div className="tableContainer">
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>Đang tải dữ liệu tài xế...</div>
          ) : currentDrivers.length > 0 ? (
            <table className="table">
              <thead className="tableHeader">
                <tr>
                  <th>Tài xế (ID/UserID)</th>
                  <th>Liên hệ</th>
                  <th>Xe/Tuyến</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="tableBody">
                {currentDrivers.map((driver) => (
                  <tr key={driver.id}>
                    <td>
                      <div className="driverInfo">
                        <div className="avatar">{driver.avatar}</div>
                        <div>
                          <div className="driverName">{driver.name}</div>
                          <div className="driverTrips">ID: {driver.id} / UserID: {driver.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contactInfo">
                        <div className="contactRow">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{driver.phone}</span>
                        </div>
                        <div className="contactRow">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{driver.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{driver.busName}</div>
                        <div style={{ color: '#6b7280' }}>{driver.routeName}</div>
                      </div>
                    </td>
                    <td>{getStatusBadge(driver.status)}</td>
                    <td>
                      <div className="actionButtons">
                        <button
                          onClick={() => setSelectedDriver(driver)}
                          className="actionButton viewButton"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenMessagePanel(driver)}
                          className="actionButton messageButton"
                          title="Gửi tin nhắn"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(driver)}
                          className="actionButton editButton"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(driver.id)}
                          className="actionButton deleteButton"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="noResults">
              <Search className="w-16 h-16" />
              <h3>Không tìm thấy kết quả</h3>
              <p>Vui lòng thử lại với từ khóa khác</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredDrivers.length > 0 && (
        <div className="pagination">
          <div className="paginationInfo">
            Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredDrivers.length)} trong tổng số {filteredDrivers.length} tài xế
          </div>
          <div className="paginationButtons">
            <button
              className="pageButton"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              if (
                pageNum === 1 || pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    className={`pageButton ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} style={{ padding: '0.5rem' }}>...</span>;
              }
              return null;
            })}

            <button
              className="pageButton"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 🔧 MessagePanel Modal - SỬ DỤNG COMPONENT MỚI */}
      {showMessagePanel && messageDriver && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowMessagePanel(false)}
        >
          <div
            style={{
              background: 'transparent',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              height: '600px',
              maxHeight: '90vh',
              minHeight: '500px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'visible',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <MessagePanelToDriver
              adminId={1}
              driverUserId={userIdToMessageId(messageDriver.userId)}
              driverName={messageDriver.name}
              onClose={() => setShowMessagePanel(false)}
            />
          </div>
        </div>
      )}

      {/* View Modal - giữ nguyên */}
      {selectedDriver && (
        <div className="modal" onClick={() => setSelectedDriver(null)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalHeaderContent">
                <div className="modalAvatar">{selectedDriver.avatar}</div>
                <div>
                  <h2 className="modalTitle">{selectedDriver.name}</h2>
                  <p className="modalSubtitle">UserID: {selectedDriver.userId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDriver(null)} className="closeButton">×</button>
            </div>

            <div className="modalBody">
              <div className="detailsGrid">
                <div className="detailItem">
                  <label>Số điện thoại</label>
                  <div className="value">{selectedDriver.phone}</div>
                </div>
                <div className="detailItem">
                  <label>Email</label>
                  <div className="value">{selectedDriver.email}</div>
                </div>
                <div className="detailItem">
                  <label>Xe buýt</label>
                  <div className="value">{selectedDriver.busName}</div>
                </div>
                <div className="detailItem">
                  <label>Tuyến đường</label>
                  <div className="value">{selectedDriver.routeName}</div>
                </div>
                <div className="detailItem">
                  <label>Trạng thái</label>
                  <div className="value">{getStatusBadge(selectedDriver.status)}</div>
                </div>
              </div>

              <div className="modalActions">
                <button onClick={() => {
                  setSelectedDriver(null);
                  handleOpenMessagePanel(selectedDriver);
                }}>Gửi tin nhắn</button>
                <button onClick={() => {
                  setSelectedDriver(null);
                  handleEditClick(selectedDriver);
                }}>Chỉnh sửa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal - Updated with Grid Layout and Fixed Dropdown */}
      {showAddModal && (
        <div className="modal" onClick={() => setShowAddModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalHeaderContent">
                <div className="modalAvatar">
                  <Plus className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="modalTitle">Thêm tài xế mới</h2>
                  <p className="modalSubtitle">Nhập thông tin tài xế</p>
                </div>
              </div>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="closeButton">×</button>
            </div>

            <div className="modalBody">
              <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="formGroup">
                  <label>Họ và tên <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Nhập họ tên..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="formInput"
                  />
                </div>
                <div className="formGroup">
                  <label>Số điện thoại <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="formInput"
                  />
                </div>
                <div className="formGroup">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    placeholder="Nhập email..."
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="formInput"
                  />
                </div>
                <div className="formGroup">
                  <label>Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "rest" })}
                    className="formSelect"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="rest">Đang nghỉ</option>
                  </select>
                </div>
                <div className="formGroup">
                  <label>Chọn xe (Tùy chọn)</label>
                  <select
                    value={formData.bus}
                    onChange={(e) => {
                      // Fix: use bus.id instead of bus.BusID
                      const selectedBus = busList.find(b => b.id === e.target.value);
                      setFormData({
                        ...formData,
                        bus: e.target.value,
                        route: selectedBus?.route_id || ""
                      });
                    }}
                    className="formSelect"
                  >
                    <option value="">-- Chọn xe --</option>
                    {busList
                      .filter(bus => !bus.driver_id) // Only show buses without drivers
                      .map(bus => (
                        // Fix: use bus.id and bus.license_plate
                        <option key={bus.id} value={bus.id}>
                          {bus.id} - {bus.license_plate}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="formGroup">
                  <label>Tuyến đường</label>
                  <input
                    type="text"
                    value={formData.route}
                    readOnly
                    placeholder="Tự động theo xe..."
                    className="formInput bg-gray-100"
                  />
                </div>
              </div>
              <div className="modalFooter" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="cancelButton"
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    fontWeight: 600,
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddDriver}
                  className="submitButton"
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  Thêm mới
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal" onClick={() => setShowEditModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalHeaderContent">
                <div className="modalAvatar">
                  <Edit className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="modalTitle">Chỉnh sửa thông tin</h2>
                  <p className="modalSubtitle">Cập nhật thông tin tài xế</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="closeButton">×</button>
            </div>

            <div className="modalBody">
              <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="formGroup">
                  <label>Họ và tên <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="formInput"
                  />
                </div>
                <div className="formGroup">
                  <label>Số điện thoại <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="formInput"
                  />
                </div>
                <div className="formGroup">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="formInput"
                  />
                </div>
                <div className="formGroup">
                  <label>Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "rest" })}
                    className="formSelect"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="rest">Đang nghỉ</option>
                  </select>
                </div>
                <div className="formGroup">
                  <label>Chọn xe (Tùy chọn)</label>
                  <select
                    value={formData.bus}
                    onChange={(e) => {
                      const selectedBus = busList.find(b => b.id === e.target.value);
                      setFormData({
                        ...formData,
                        bus: e.target.value,
                        route: selectedBus?.route_id || ""
                      });
                    }}
                    className="formSelect"
                  >
                    <option value="">-- Chọn xe --</option>
                    {busList
                      .filter(bus => !bus.driver_id || (editingDriver && bus.driver_id === editingDriver.id))
                      .map(bus => (
                        <option key={bus.id} value={bus.id}>
                          {bus.id} - {bus.license_plate}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="formGroup">
                  <label>Tuyến đường</label>
                  <input
                    type="text"
                    value={formData.route}
                    readOnly
                    placeholder="Tự động theo xe..."
                    className="formInput bg-gray-100"
                  />
                </div>
              </div>
              <div className="modalFooter" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="cancelButton"
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    fontWeight: 600,
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateDriver}
                  className="submitButton"
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal - Redesigned */}
      {showDeleteConfirm && (
        <div className="modal" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="modalContent deleteModal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '400px',
              padding: '2rem',
              textAlign: 'center',
              borderRadius: '1rem'
            }}
          >
            <div
              className="deleteIcon"
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}
            >
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2
              className="deleteTitle"
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}
            >
              Xác nhận xóa
            </h2>
            <p
              className="deleteMessage"
              style={{
                color: '#6b7280',
                marginBottom: '2rem',
                lineHeight: '1.5'
              }}
            >
              Bạn có chắc chắn muốn xóa tài xế này? <br />
              Hành động này không thể hoàn tác.
            </p>
            <div
              className="deleteActions"
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem'
              }}
            >
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="cancelButton"
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  fontWeight: 600,
                  border: '1px solid #d1d5db',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="deleteConfirmButton"
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
