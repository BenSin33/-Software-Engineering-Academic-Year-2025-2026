"use client";

import { useState, useEffect, useMemo } from "react";
import "./BusesPage.css";
import { Filter, Search } from "lucide-react";
import {
  fetchAllBuses,
  fetchBusById,
  createBus,
  updateBus,
  deleteBus,
  BusFrontend,
  BusCreateRequest,
  BusUpdateRequest,
  mapBusFrontendToBackend,
} from "@/app/API/busService";
import { fetchAllDrivers } from "@/app/API/driverService";
import { fetchRouteService } from "@/app/API/routeService";

export default function BusesPage() {
  const [buses, setBuses] = useState<BusFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusFrontend | null>(null);
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [drivers, setDrivers] = useState<any[]>([]); // [{id, name,...}]
  const [routes, setRoutes] = useState<any[]>([]);   // [{RouteID, RouteName,...}]
  // Dùng DriverID, RouteID chứ không lưu tên để liên kết chắc chắn
  const [driverMap, setDriverMap] = useState<{ [key: number]: any }>({});

  const initialFormData: Partial<BusFrontend> = {
    id: "",
    license_plate: "",
    status: "ready",
    capacity: 0,
    current_load: 0,
    fuel_level: 100,
    driver_name: "",
    route_id: "",
    location: "",
    PickUpLocation: "",
    DropOffLocation: "",
  };

  const [formData, setFormData] = useState<Partial<BusFrontend>>(initialFormData);

  const [advancedFilters, setAdvancedFilters] = useState({
    minCapacity: "",
    maxCapacity: "",
    minFuel: "",
    route: "",
  });

  const itemsPerPage = 4;
  const LOCATION_SERVICE_URL = "http://localhost:5010/api";

  //  Sử dụng API service để fetch buses
  const loadBuses = async () => {
    setLoading(true);
    try {
      const busesData = await fetchAllBuses(
        {
          status: filterStatus !== "all" ? filterStatus : undefined,
          search: searchTerm || undefined,
          minCapacity: advancedFilters.minCapacity ? parseInt(advancedFilters.minCapacity) : undefined,
          maxCapacity: advancedFilters.maxCapacity ? parseInt(advancedFilters.maxCapacity) : undefined,
          minFuel: advancedFilters.minFuel ? parseInt(advancedFilters.minFuel) : undefined,
          route: advancedFilters.route || undefined,
        },
        { limit: 1000, offset: 0 }
      );
      // Liên kết vị trí từ location_service
      const busesWithLocation = await Promise.all(
        busesData.map(async (b) => {
          try {
            const res = await fetch(`${LOCATION_SERVICE_URL}/locations/bus/${b.id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.data) {
                const { Latitude, Longitude } = data.data;
                return { ...b, location: `${Latitude.toFixed(5)}, ${Longitude.toFixed(5)}` } as BusFrontend;
              }
            }
          } catch (e) {
            // ignore per-bus error; keep previous location
          }
          return b;
        })
      );
      setBuses(busesWithLocation);
    } catch (error: any) {
      console.error(error);
      alert("Lỗi khi tải dữ liệu xe buýt: " + error.message);
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuses();
  }, []);

  // Fetch drivers and routes for dropdown
  useEffect(() => {
    (async () => {
      try {
        const driverData = await fetchAllDrivers({ status: "active" });
        setDrivers(driverData);
        const routeRes = await fetchRouteService();
        if (Array.isArray(routeRes?.routes)) setRoutes(routeRes.routes);
      } catch (error) { console.error(error); }
    })();
  }, []);

  const stats = useMemo(() => {
    return {
      total: buses.length,
      running: buses.filter((b) => b.status === "running").length,
      waiting: buses.filter((b) => b.status === "waiting").length,
      maintenance: buses.filter((b) => b.status === "maintenance").length,
      ready: buses.filter((b) => b.status === "ready").length,
      totalCapacity: buses.reduce((sum, b) => sum + b.capacity, 0),
      registered: buses.reduce((sum, b) => sum + b.current_load, 0),
    };
  }, [buses]);

  const getStatusBadge = (status: string) => {
    const badges = {
      running: { text: "Đang chạy", class: "status-badge-running" },
      waiting: { text: "Đang chờ", class: "status-badge-waiting" },
      maintenance: { text: "Bảo trì", class: "status-badge-maintenance" },
      ready: { text: "Sẵn sàng", class: "status-badge-ready" },
    };
    return badges[status as keyof typeof badges] || badges.ready;
  };

  const filteredBuses = useMemo(() => {
    return buses
      .filter((bus) => {
        const matchesSearch =
          (bus.id?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
          (bus.license_plate?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
          (bus.driver_name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === "all" || bus.status === filterStatus;

        const matchesAdvanced =
          (!advancedFilters.minCapacity || bus.capacity >= parseInt(advancedFilters.minCapacity)) &&
          (!advancedFilters.maxCapacity || bus.capacity <= parseInt(advancedFilters.maxCapacity)) &&
          (!advancedFilters.minFuel || bus.fuel_level >= parseInt(advancedFilters.minFuel)) &&
          (!advancedFilters.route || (bus.route_id?.toLowerCase() ?? "").includes(advancedFilters.route.toLowerCase()));

        return matchesSearch && matchesFilter && matchesAdvanced;
      })
      .sort((a, b) => {
        type FieldValue = string | number | undefined;

        const aRaw = a[sortBy as keyof BusFrontend];
        const bRaw = b[sortBy as keyof BusFrontend];

        const aVal: FieldValue = typeof aRaw === "number" ? aRaw : aRaw !== undefined && aRaw !== null ? String(aRaw).toLowerCase() : undefined;
        const bVal: FieldValue = typeof bRaw === "number" ? bRaw : bRaw !== undefined && bRaw !== null ? String(bRaw).toLowerCase() : undefined;

        if (aVal === undefined && bVal === undefined) return 0;
        if (aVal === undefined) return sortOrder === "asc" ? 1 : -1;
        if (bVal === undefined) return sortOrder === "asc" ? -1 : 1;

        if (typeof aVal === "string" && typeof bVal === "string") {
          if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
          if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
          return 0;
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
          if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
          return 0;
        }

        const aStr = String(aVal);
        const bStr = String(bVal);
        if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
        if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [buses, searchTerm, filterStatus, advancedFilters, sortBy, sortOrder]);

  const paginatedBuses = useMemo(() => {
    const totalPages = Math.ceil(filteredBuses.length / itemsPerPage);
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
    if (currentPage !== validCurrentPage && totalPages > 0) {
      setCurrentPage(validCurrentPage);
    }

    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredBuses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBuses, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredBuses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const availableDrivers = useMemo(() => {
    // lọc driver chưa bị gán xe khác (hoặc là driver của bus đang sửa)
    return drivers.filter(d =>
      !buses.some(b => b.driver_id === d.id && b.id !== formData.id)
    );
  }, [drivers, buses, formData.id]);

  //  Sử dụng API service để thêm bus
  const handleAddBus = async () => {
    if (!formData.id || !formData.license_plate || !formData.capacity) {
      alert("Vui lòng điền đủ thông tin bắt buộc (Mã xe, Biển số, Sức chứa)!");
      return;
    }
    const newBusData: BusCreateRequest = {
      BusID: formData.id,
      PlateNumber: formData.license_plate,
      Capacity: Number(formData.capacity) || 0,
      CurrentLoad: Number(formData.current_load) || 0,
      FuelLevel: Number(formData.fuel_level) || 100,
      Status: formData.status || "ready",
      Location: formData.location || null,
      PickUpLocation: formData.PickUpLocation || null,
      DropOffLocation: formData.DropOffLocation || null,
      DriverID: formData.driver_id ? Number(formData.driver_id) : null,
      RouteID: formData.route_id && formData.route_id !== "N/A" ? formData.route_id : null,
    };

    try {
      await createBus(newBusData);
      alert("Thêm xe thành công!");
      setShowAddModal(false);
      resetForm();
      loadBuses();
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  //  Sử dụng API service để cập nhật bus
  const handleEditBus = async () => {
    if (!selectedBus) return;

    const updatedData: BusUpdateRequest = {
      PlateNumber: formData.license_plate,
      Capacity: Number(formData.capacity) || 0,
      CurrentLoad: Number(formData.current_load) || 0,
      FuelLevel: Number(formData.fuel_level) || 100,
      Status: formData.status,
      Location: formData.location || null,
      PickUpLocation: formData.PickUpLocation || null,
      DropOffLocation: formData.DropOffLocation || null,
      RouteID: formData.route_id && formData.route_id !== "N/A" ? formData.route_id : null,
    };

    try {
      await updateBus(selectedBus.id, updatedData);
      alert("Cập nhật xe thành công!");
      setShowEditModal(false);
      resetForm();
      await loadBuses(); // reload để cập nhật cả vị trí mới
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  //  Sử dụng API service để xóa bus
  const handleDeleteBus = async (busId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      try {
        await deleteBus(busId);
        alert("Xóa xe thành công!");
        loadBuses();
      } catch (error: any) {
        alert(`Lỗi: ${error.message}`);
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedBus(null);
  };

  const openEditModal = (bus: BusFrontend) => {
    setSelectedBus(bus);
    setFormData({ ...bus });
    setShowEditModal(true);
  };

  const openDetailModal = (bus: BusFrontend) => {
    setSelectedBus(bus);
    setShowDetailModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    resetForm();
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBus(null);
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", fontSize: "18px" }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="buses-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Xe buýt</h1>
          <p className="page-subtitle">Quản lý và giám sát đội xe đưa đón học sinh</p>
        </div>
        <button className="btn-add-bus" onClick={() => setShowAddModal(true)}>
          <span className="btn-icon">+</span>
          Thêm xe mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">🚌</div>
          <div className="stat-content">
            <div className="stat-label">Tổng số xe</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-label">Đang chạy</div>
            <div className="stat-value">{stats.running}</div>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <div className="stat-label">Đang chờ</div>
            <div className="stat-value">{stats.waiting}</div>
          </div>
        </div>
        <div className="stat-card stat-red">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <div className="stat-label">Bảo trì</div>
            <div className="stat-value">{stats.maintenance}</div>
          </div>
        </div>
        <div className="stat-card stat-light-blue">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-label">Sẵn sàng</div>
            <div className="stat-value">{stats.ready}</div>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Tổng sức chứa</div>
            <div className="stat-value">{stats.totalCapacity}</div>
          </div>
        </div>
        <div className="stat-card stat-dark-orange">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-label">Đang sử dụng</div>
            <div className="stat-value">{stats.registered}</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã xe, biển số, tài xế..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
        <button
          className="btn-advanced-filter"
          onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
        >
          <Filter size={16} />
          Tìm kiếm nâng cao
        </button>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedFilter && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px", fontWeight: 600 }}>
            Bộ lọc nâng cao
          </h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}
          >
            <div>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280" }}>
                Sức chứa tối thiểu
              </label>
              <input
                type="number"
                value={advancedFilters.minCapacity}
                onChange={(e) => {
                  setAdvancedFilters({ ...advancedFilters, minCapacity: e.target.value });
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280" }}>
                Sức chứa tối đa
              </label>
              <input
                type="number"
                value={advancedFilters.maxCapacity}
                onChange={(e) => {
                  setAdvancedFilters({ ...advancedFilters, maxCapacity: e.target.value });
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280" }}>
                Nhiên liệu tối thiểu (%)
              </label>
              <input
                type="number"
                value={advancedFilters.minFuel}
                onChange={(e) => {
                  setAdvancedFilters({ ...advancedFilters, minFuel: e.target.value });
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280" }}>
                Tuyến đường
              </label>
              <input
                type="text"
                value={advancedFilters.route}
                onChange={(e) => {
                  setAdvancedFilters({ ...advancedFilters, route: e.target.value });
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              setAdvancedFilters({ minCapacity: "", maxCapacity: "", minFuel: "", route: "" });
              setCurrentPage(1);
            }}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              background: "#f3f4f6",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {(["all", "running", "waiting", "maintenance", "ready"] as const).map((status) => (
          <button
            key={status}
            className={`filter-tab ${filterStatus === status ? "active" : ""}`}
            onClick={() => {
              setFilterStatus(status);
              setCurrentPage(1);
            }}
          >
            {status === "all"
              ? "Tất cả"
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Bus Cards Grid */}
      <div className="bus-cards-grid">
        {paginatedBuses.map((bus) => {
          const statusBadge = getStatusBadge(bus.status);
          return (
            <div key={bus.id} className="bus-card">
              <div className="bus-card-header">
                <div className="bus-card-title-section">
                  <h3 className="bus-card-id">{bus.id}</h3>
                  <span className={`status-badge ${statusBadge.class}`}>
                    <span className="status-dot"></span>
                    {statusBadge.text}
                  </span>
                </div>
                <div className="bus-card-license">{bus.license_plate}</div>
              </div>

              <div className="progress-section">
                <div className="progress-item">
                  <div className="progress-label">
                    <span>Sức chứa</span>
                    <span className="progress-value">
                      {bus.current_load}/{bus.capacity}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-fill-blue"
                      style={{
                        width: `${bus.capacity > 0 ? (bus.current_load / bus.capacity) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="progress-item">
                  <div className="progress-label">
                    <span>Nhiên liệu</span>
                    <span className="progress-value">{bus.fuel_level}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-fill-green"
                      style={{ width: `${bus.fuel_level}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bus-info-grid">
                <div className="bus-info-item">
                  <div className="info-label">TÀI XẾ</div>
                  <div className="info-value">{bus.driver_name || "N/A"}</div>
                </div>
                <div className="bus-info-item">
                  <div className="info-label">TUYẾN ĐƯỜNG</div>
                  <div className="info-value">{bus.route_id || "N/A"}</div>
                </div>
                <div className="bus-info-item">
                  <div className="info-label">ĐIỂM ĐI</div>
                  <div className="info-value">{bus.PickUpLocation || "N/A"}</div>
                </div>
                <div className="bus-info-item">
                  <div className="info-label">ĐIỂM ĐẾN</div>
                  <div className="info-value">{bus.DropOffLocation || "N/A"}</div>
                </div>
              </div>

              <div className="bus-location">
                <span className="location-icon">📍</span>
                <div>
                  <div className="location-label">VỊ TRÍ HIỆN TẠI</div>
                  <div className="location-value">{bus.location || "N/A"}</div>
                </div>
              </div>

              <div className="bus-card-actions">
                <button className="btn-action btn-primary" onClick={() => openDetailModal(bus)}>
                  <span className="btn-action-icon">👁</span>
                  Chi tiết
                </button>
                <button className="btn-action btn-icon-only" onClick={() => openDetailModal(bus)}>
                  <span>📊</span>
                </button>
                <button className="btn-action btn-icon-only" onClick={() => openEditModal(bus)}>
                  <span>✏️</span>
                </button>
                <button
                  className="btn-action btn-icon-only btn-delete"
                  onClick={() => handleDeleteBus(bus.id)}
                >
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results message */}
      {filteredBuses.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
          <p style={{ fontSize: "18px", fontWeight: 600 }}>Không tìm thấy xe nào</p>
          <p style={{ fontSize: "14px" }}>Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn</p>
        </div>
      )}

      {/* Pagination */}
      {filteredBuses.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBuses.length)} trong tổng số{" "}
            {filteredBuses.length} xe
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ‹ Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? "pagination-btn-active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau ›
            </button>
          </div>
        </div>
      )}

      {/* Add Bus Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseAddModal}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: "24px", fontSize: "24px", fontWeight: 700 }}>
              Thêm xe mới
            </h2>
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Mã xe *
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="VD: BUS-08"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Biển số *
                </label>
                <input
                  type="text"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="VD: 51A-12345"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Sức chứa *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BusFrontend["status"] })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="ready">Sẵn sàng</option>
                    <option value="running">Đang chạy</option>
                    <option value="waiting">Đang chờ</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Tài xế *
                </label>
                <select
                  value={formData.driver_id || ""}
                  onChange={e => setFormData({ ...formData, driver_id: e.target.value ? Number(e.target.value) : undefined })}
                  style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                >
                  <option value="">-- Chọn tài xế --</option>
                  {availableDrivers.map(driver => (
                    <option value={driver.id} key={driver.id}>
                      {driver.name} / {driver.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Tuyến đường *
                </label>
                <select
                  value={formData.route_id || ""}
                  onChange={e => {
                    const selectedRouteId = e.target.value;
                    const selectedRoute = routes.find(r => String(r.RouteID) === selectedRouteId);
                    setFormData({
                      ...formData,
                      route_id: selectedRouteId,
                      PickUpLocation: selectedRoute ? selectedRoute.StartLocation : formData.PickUpLocation,
                      DropOffLocation: selectedRoute ? selectedRoute.EndLocation : formData.DropOffLocation
                    });
                  }}
                  style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }}
                >
                  <option value="">-- Chọn tuyến --</option>
                  {routes.map(route => (
                    <option value={route.RouteID} key={route.RouteID}>
                      {route.RouteName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Điểm đi
                </label>
                <input
                  type="text"
                  value={formData.PickUpLocation}
                  onChange={(e) => setFormData({ ...formData, PickUpLocation: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="VD: 227 Nguyễn Văn Cừ, P4, Q5"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Điểm đến
                </label>
                <input
                  type="text"
                  value={formData.DropOffLocation}
                  onChange={(e) => setFormData({ ...formData, DropOffLocation: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="VD: Trường THPT Năng khiếu"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Vị trí
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="VD: Bãi đỗ trường"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={handleAddBus}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#FFAC50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Thêm xe
              </button>
              <button
                onClick={handleCloseAddModal}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bus Modal */}
      {showEditModal && selectedBus && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseEditModal}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: "24px", fontSize: "24px", fontWeight: 700 }}>
              Chỉnh sửa xe {selectedBus.id}
            </h2>

            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Biển số *
                </label>
                <input
                  type="text"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Sức chứa *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Hiện tại
                  </label>
                  <input
                    type="number"
                    value={formData.current_load}
                    onChange={(e) => setFormData({ ...formData, current_load: parseInt(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Nhiên liệu (%)
                  </label>
                  <input
                    type="number"
                    value={formData.fuel_level}
                    onChange={(e) => setFormData({ ...formData, fuel_level: parseInt(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as BusFrontend["status"] })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="ready">Sẵn sàng</option>
                  <option value="running">Đang chạy</option>
                  <option value="waiting">Đang chờ</option>
                  <option value="maintenance">Bảo trì</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Tài xế
                </label>
                <input
                  type="text"
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Tuyến đường
                </label>
                <input
                  type="text"
                  value={formData.route_id}
                  onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Điểm đi
                </label>
                <input
                  type="text"
                  value={formData.PickUpLocation}
                  onChange={(e) => setFormData({ ...formData, PickUpLocation: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Điểm đến
                </label>
                <input
                  type="text"
                  value={formData.DropOffLocation}
                  onChange={(e) => setFormData({ ...formData, DropOffLocation: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Vị trí
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={handleEditBus}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#FFAC50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cập nhật
              </button>
              <button
                onClick={handleCloseEditModal}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBus && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseDetailModal}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "700px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
                Chi tiết xe {selectedBus.id}
              </h2>
              <span className={`status-badge ${getStatusBadge(selectedBus.status).class}`}>
                <span className="status-dot"></span>
                {getStatusBadge(selectedBus.status).text}
              </span>
            </div>

            <div style={{ display: "grid", gap: "24px" }}>
              <div>
                <h3
                  style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#111827" }}
                >
                  Thông tin cơ bản
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        marginBottom: "4px",
                      }}
                    >
                      BIỂN SỐ
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.license_plate}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        marginBottom: "4px",
                      }}
                    >
                      SỨC CHỨA
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.capacity} người
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3
                  style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#111827" }}
                >
                  Trạng thái hiện tại
                </h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginBottom: "8px",
                        fontWeight: 600,
                      }}
                    >
                      Số hành khách: {selectedBus.current_load}/{selectedBus.capacity}
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "#e5e7eb",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${selectedBus.capacity > 0 ? (selectedBus.current_load / selectedBus.capacity) * 100 : 0}%`,
                          background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
                          borderRadius: "10px",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginBottom: "8px",
                        fontWeight: 600,
                      }}
                    >
                      Nhiên liệu: {selectedBus.fuel_level}%
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "#e5e7eb",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${selectedBus.fuel_level}%`,
                          background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                          borderRadius: "10px",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3
                  style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#111827" }}
                >
                  Thông tin vận hành
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        marginBottom: "4px",
                      }}
                    >
                      TÀI XẾ
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.driver_name || "N/A"}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        marginBottom: "4px",
                      }}
                    >
                      TUYẾN ĐƯỜNG
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.route_id || "N/A"}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        marginBottom: "4px",
                      }}
                    >
                      ĐIỂM ĐI
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.PickUpLocation || "N/A"}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        marginBottom: "4px",
                      }}
                    >
                      ĐIỂM ĐẾN
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.DropOffLocation || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3
                  style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#111827" }}
                >
                  Vị trí
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "16px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>📍</span>
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        marginBottom: "4px",
                      }}
                    >
                      VỊ TRÍ HIỆN TẠI
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                      {selectedBus.location || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(selectedBus);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#FFAC50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}>
                Chỉnh sửa
              </button>
              <button
                onClick={handleCloseDetailModal}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}