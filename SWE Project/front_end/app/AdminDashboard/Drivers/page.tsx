"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  UserCircle, Phone, Mail, CheckCircle, Clock, Search, 
  Plus, Edit, Trash2, Eye, Filter, ChevronLeft, ChevronRight, 
  X, AlertTriangle
} from "lucide-react";
import "./DriversPage.css";
import { fetchAllBuses } from "@/app/API/busService";
import { fetchRouteService } from "@/app/API/routeService";

// NOTE: Removed example imports and top-level await calls that referenced '@/API/driverService' because that path could not be resolved.
// This component uses direct fetch(...) calls to API_URL inside fetchData; if you have a driverService module, import it with the correct relative path
// (for example: import { fetchAllDrivers } from '../../../API/driverService';) and remove the example top-level awaits below.
// Interface đã được đơn giản hóa (loại bỏ các trường mock)
interface Driver {
  id: number;
  userId: number; 
  name: string;
  phone: string;
  email: string;
  bus: string;
  route: string;
  status: "active" | "rest";
  avatar: string;
}

// FormData đã được đơn giản hóa
interface FormData {
  userId: string;
  name: string;
  phone: string;
  email: string;
  status: "active" | "rest"; // Thêm status vào form
  bus: string; // Thêm bus vào form
  route: string; // Thêm route vào form
}

// Định nghĩa kiểu dữ liệu cho API
interface ApiDriver {
  DriverID: number;
  UserID: number;
  Fullname: string;
  PhoneNumber: string;
  Email: string;
  Status: "active" | "rest";
}

interface ApiBus {
  BusID: string;
  RouteID: string | null;
  DriverID: number | null;
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
  const [deletingDriverId, setDeletingDriverId] = useState<number | null>(null);
  
  const [driverStats, setDriverStats] = useState<ApiDriverStats>({ total: 0, active: 0, rest: 0 });
  const [busList, setBusList] = useState<any[]>([]);
  const [routeList, setRouteList] = useState<any[]>([]);

  // initialFormData đã được đơn giản hóa
  const initialFormData: FormData = {
    userId: "",
    name: "",
    phone: "",
    email: "",
    status: "active",
    bus: "",
    route: "",
  };
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // advancedFilters đã được đơn giản hóa
  const [advancedFilters, setAdvancedFilters] = useState({
    name: "",
    phone: "",
    email: "",
    bus: "",
    route: "",
  });

  const itemsPerPage = 5;
  const API_URL = "http://localhost:3002/api";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, driversRes, busesRes] = await Promise.all([
        fetch(`${API_URL}/drivers/stats`),
        fetch(`${API_URL}/drivers?limit=1000`),
        fetch(`${API_URL}/buses?limit=1000`)
      ]);

      if (!statsRes.ok) throw new Error("Không thể tải thống kê tài xế");
      if (!driversRes.ok) throw new Error("Không thể tải danh sách tài xế");
      if (!busesRes.ok) throw new Error("Không thể tải danh sách xe");

      const statsData = await statsRes.json();
      const driversData = await driversRes.json();
      const busesData = await busesRes.json();

      if (statsData.success) {
        setDriverStats(statsData.data);
      }

      if (driversData.success && busesData.success) {
        const busMap = new Map<number, { busId: string; routeId: string }>();
        if (Array.isArray(busesData.data)) {
          busesData.data.forEach((bus: ApiBus) => {
            if (bus.DriverID) {
              busMap.set(bus.DriverID, {
                busId: bus.BusID,
                routeId: bus.RouteID || "N/A"
              });
            }
          });
        }

        // Ánh xạ dữ liệu - đã loại bỏ mock
        const mappedDrivers = driversData.data.map((driver: ApiDriver): Driver => {
          const assignedBus = busMap.get(driver.DriverID);
          
          return {
            id: driver.DriverID,
            userId: driver.UserID,
            name: driver.Fullname,
            phone: driver.PhoneNumber,
            email: driver.Email,
            status: driver.Status,
            bus: assignedBus ? assignedBus.busId : "-",
            route: assignedBus ? assignedBus.routeId : "-",
            avatar: driver.Fullname.charAt(0).toUpperCase()
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

  // Lọc - đã đơn giản hóa
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
        driver.bus.toLowerCase().includes(advancedFilters.bus.toLowerCase());
      const matchesRoute = !advancedFilters.route || 
        driver.route.toLowerCase().includes(advancedFilters.route.toLowerCase());

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

  // Thống kê - đã đơn giản hóa
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

  // Thêm tài xế
  const handleAddDriver = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.userId || !formData.bus || !formData.route) {
      alert("Vui lòng điền đủ các trường bắt buộc, bao gồm xe bus & tuyến đường!");
      return;
    }

    const newDriverData = {
      UserID: parseInt(formData.userId),
      Fullname: formData.name,
      PhoneNumber: formData.phone,
      Email: formData.email,
      Status: formData.status,
      BusID: formData.bus, // Thêm BusID
      RouteID: formData.route, // Thêm RouteID
    };

    try {
      const response = await fetch(`${API_URL}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDriverData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Lỗi khi thêm tài xế");
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

  // Mở modal sửa
  const handleEditClick = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      userId: driver.userId.toString(),
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      status: driver.status,
      bus: driver.bus, // Không cần thiết trong form sửa
      route: driver.route,
    });
    setShowEditModal(true);
  };

  // Cập nhật tài xế
  const handleUpdateDriver = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc (Tên, SĐT, Email)!");
      return;
    }
    if (!editingDriver) return;

    // Gửi các trường có trong DB
    const updatedData = {
      Fullname: formData.name,
      PhoneNumber: formData.phone,
      Email: formData.email,
      Status: formData.status,
      BusID: formData.bus, // Thêm BusID
      RouteID: formData.route, // Thêm RouteID
    };

    try {
      const response = await fetch(`${API_URL}/drivers/${editingDriver.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Lỗi khi cập nhật");
      }

      // Cập nhật trạng thái riêng nếu cần (backend có endpoint riêng)
      if (editingDriver.status !== formData.status) {
        await fetch(`${API_URL}/drivers/${editingDriver.id}/status`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ status: formData.status }),
        });
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

  const handleDeleteClick = (id: number) => {
    setDeletingDriverId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingDriverId !== null) {
      try {
        const response = await fetch(`${API_URL}/drivers/${deletingDriverId}`, {
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

  // Giao diện
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
          <strong>Lỗi tải dữ liệu:</strong> {error}. Hãy đảm bảo backend (cổng 3002) đang chạy.
        </div>
      )}

      {/* Stats (Đã xóa Đánh giá) */}
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
            className={`filterButton ${
              filterStatus === "all" ? "active bg-blue-600" : "inactive"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`filterButton ${
              filterStatus === "active" ? "active bg-green-600" : "inactive"
            }`}
          >
            Hoạt động
          </button>
          <button
            onClick={() => setFilterStatus("rest")}
            className={`filterButton ${
              filterStatus === "rest" ? "active bg-yellow-600" : "inactive"
            }`}
          >
            Nghỉ
          </button>
        </div>

        {/* Advanced Search (Đã xóa các trường mock) */}
        {showAdvancedSearch && (
          <div className="advancedSearchPanel">
            <div className="advancedSearchGrid">
              <div className="formGroup">
                <label>Tên tài xế</label>
                <input
                  type="text"
                  placeholder="Nhập tên..."
                  value={advancedFilters.name}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, name: e.target.value})}
                />
              </div>
              <div className="formGroup">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại..."
                  value={advancedFilters.phone}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, phone: e.target.value})}
                />
              </div>
              <div className="formGroup">
                <label>Email</label>
                <input
                  type="text"
                  placeholder="Nhập email..."
                  value={advancedFilters.email}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, email: e.target.value})}
                />
              </div>
              <div className="formGroup">
                <label>Xe buýt</label>
                <input
                  type="text"
                  placeholder="VD: BUS-01"
                  value={advancedFilters.bus}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, bus: e.target.value})}
                />
              </div>
              <div className="formGroup">
                <label>Tuyến đường</label>
                <input
                  type="text"
                  placeholder="VD: ROUTE-01"
                  value={advancedFilters.route}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, route: e.target.value})}
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

      {/* Drivers Table (Đã xóa các trường mock) */}
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
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{driver.bus}</div>
                        <div style={{ color: '#6b7280' }}>{driver.route}</div>
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
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Không tìm thấy kết quả
              </h3>
              <p>Vui lòng thử lại với từ khóa khác hoặc tải lại trang</p>
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
              // Logic hiển thị phân trang
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

      {/* Driver Detail Modal (Đã đơn giản hóa) */}
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
              <button 
                onClick={() => setSelectedDriver(null)}
                className="closeButton"
              >
                ×
              </button>
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
                  <div className="value">{selectedDriver.bus}</div>
                </div>
                <div className="detailItem">
                  <label>Tuyến đường</label>
                  <div className="value">{selectedDriver.route}</div>
                </div>
                <div className="detailItem">
                  <label>Trạng thái</label>
                  <div className="value">{getStatusBadge(selectedDriver.status)}</div>
                </div>
              </div>

              <div className="modalActions">
                <button>Xem lịch làm việc</button>
                <button>Gửi tin nhắn</button>
                <button onClick={() => {
                  setSelectedDriver(null);
                  handleEditClick(selectedDriver);
                }}>Chỉnh sửa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver Modal (Đã đơn giản hóa) */}
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
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="closeButton"
              >
                ×
              </button>
            </div>
            
            <div className="modalBody">
              <div className="detailsGrid">
                <div className="formGroup">
                  <label>UserID (Từ Service Người dùng) *</label>
                  <input
                    type="number"
                    placeholder="VD: 101"
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Tên tài xế *</label>
                  <input
                    type="text"
                    placeholder="Nhập tên..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Số điện thoại *</label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="Nhập email..."
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Xe Buýt *</label>
                  <select
                    value={formData.bus || ''}
                    onChange={e => setFormData({ ...formData, bus: e.target.value })}
                  >
                    <option value="">-- Chọn bus --</option>
                    {busList.filter(b => !b.driver_name || b.driver_name === formData.name).map(bus => (
                      <option value={bus.id} key={bus.id}>{bus.license_plate} ({bus.id})</option>
                    ))}
                  </select>
                </div>
                <div className="formGroup">
                  <label>Tuyến đường *</label>
                  <select
                    value={formData.route || ''}
                    onChange={e => setFormData({ ...formData, route: e.target.value })}
                  >
                    <option value="">-- Chọn tuyến đường --</option>
                    {routeList.map(r => (
                      <option value={r.RouteID} key={r.RouteID}>{r.RouteName}</option>
                    ))}
                  </select>
                </div>
                <div className="formGroup">
                  <label>Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "rest" })}
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="rest">Đang nghỉ</option>
                  </select>
                </div>
              </div>

              <div className="modalActions">
                <button onClick={handleAddDriver}>Thêm tài xế</button>
                <button onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Driver Modal (Đã đơn giản hóa) */}
      {showEditModal && editingDriver && (
        <div className="modal" onClick={() => setShowEditModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalHeaderContent">
                <div className="modalAvatar">{editingDriver.avatar}</div>
                <div>
                  <h2 className="modalTitle">Chỉnh sửa thông tin</h2>
                  <p className="modalSubtitle">{editingDriver.name}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDriver(null);
                  resetForm();
                }}
                className="closeButton"
              >
                ×
              </button>
            </div>
            
            <div className="modalBody">
              <div className="detailsGrid">
                 <div className="formGroup">
                  <label>UserID (Không thể thay đổi)</label>
                  <input
                    type="number"
                    value={formData.userId}
                    readOnly
                    disabled
                    style={{ backgroundColor: "#f3f4f6" }}
                  />
                </div>
                <div className="formGroup">
                  <label>Tên tài xế *</label>
                  <input
                    type="text"
                    placeholder="Nhập tên..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Số điện thoại *</label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="Nhập email..."
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                 <div className="formGroup">
                  <label>Xe Buýt *</label>
                  <select
                    value={formData.bus || ''}
                    onChange={e => setFormData({ ...formData, bus: e.target.value })}
                  >
                    <option value="">-- Chọn bus --</option>
                    {busList.filter(b => !b.driver_name || b.driver_name === formData.name).map(bus => (
                      <option value={bus.id} key={bus.id}>{bus.license_plate} ({bus.id})</option>
                    ))}
                  </select>
                </div>
                <div className="formGroup">
                  <label>Tuyến đường *</label>
                  <select
                    value={formData.route || ''}
                    onChange={e => setFormData({ ...formData, route: e.target.value })}
                  >
                    <option value="">-- Chọn tuyến đường --</option>
                    {routeList.map(r => (
                      <option value={r.RouteID} key={r.RouteID}>{r.RouteName}</option>
                    ))}
                  </select>
                </div>
                 <div className="formGroup">
                  <label>Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "rest" })}
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="rest">Đang nghỉ</option>
                  </select>
                </div>
              </div>

              <div className="modalActions">
                <button onClick={handleUpdateDriver}>Cập nhật</button>
                <button onClick={() => {
                  setShowEditModal(false);
                  setEditingDriver(null);
                  resetForm();
                }}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '28rem' }}>
            <div className="modalHeader">
              <div className="modalHeaderContent">
                <div className="modalAvatar" style={{ backgroundColor: '#dc2626' }}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="modalTitle">Xác nhận xóa</h2>
                  <p className="modalSubtitle">Bạn có chắc chắn muốn xóa tài xế này?</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingDriverId(null);
                }}
                className="closeButton"
              >
                ×
              </button>
            </div>
            
            <div className="modalBody">
              <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                Hành động này không thể hoàn tác. Tất cả thông tin của tài xế sẽ bị xóa.
              </p>

              <div className="modalActions">
                <button 
                  onClick={handleConfirmDelete}
                  style={{ backgroundColor: '#dc2626' }}
                >
                  Xóa tài xế
                </button>
                <button onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingDriverId(null);
                }}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}