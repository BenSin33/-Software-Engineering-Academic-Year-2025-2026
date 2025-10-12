"use client";

import { useState } from "react";
import "./BusesPage.css";
import { Filter, Search } from "lucide-react";

interface Bus {
  id: string;
  licensePlate: string;
  model: string;
  year: number;
  status: "running" | "waiting" | "maintenance" | "ready";
  capacity: number;
  currentLoad: number;
  fuelLevel: number;
  driver: string;
  route: string;
  speed: number;
  distance: number;
  location: string;
  lastMaintenance: string;
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([
    {
      id: "BUS-01",
      licensePlate: "51A-12345",
      model: "Hyundai Universe",
      year: 2020,
      status: "running",
      capacity: 45,
      currentLoad: 38,
      fuelLevel: 85,
      driver: "Lê Văn Cường",
      route: "Tuyến 1",
      speed: 42,
      distance: 156200,
      location: "Võ Văn Tần, Q.3",
      lastMaintenance: "10/05/2024",
    },
    {
      id: "BUS-03",
      licensePlate: "51B-23456",
      model: "Thaco Universe",
      year: 2021,
      status: "running",
      capacity: 40,
      currentLoad: 32,
      fuelLevel: 75,
      driver: "Nguyễn Thị Mai",
      route: "Tuyến 2",
      speed: 38,
      distance: 142300,
      location: "Lê Lợi, Q.1",
      lastMaintenance: "15/04/2024",
    },
    {
      id: "BUS-05",
      licensePlate: "51C-34567",
      model: "Hyundai County",
      year: 2019,
      status: "running",
      capacity: 35,
      currentLoad: 28,
      fuelLevel: 85,
      driver: "Lê Văn Cường",
      route: "Tuyến 3",
      speed: 42,
      distance: 156200,
      location: "Võ Văn Tần, Q.3",
      lastMaintenance: "10/05/2024",
    },
    {
      id: "BUS-07",
      licensePlate: "51D-45678",
      model: "Mercedes-Benz Sprinter",
      year: 2022,
      status: "waiting",
      capacity: 25,
      currentLoad: 0,
      fuelLevel: 90,
      driver: "Phạm Thị Dung",
      route: "Tuyến 4",
      speed: 0,
      distance: 67890,
      location: "Bãi đỗ trường",
      lastMaintenance: "25/05/2024",
    },
    {
      id: "BUS-02",
      licensePlate: "51A-98765",
      model: "Hyundai County",
      year: 2021,
      status: "maintenance",
      capacity: 35,
      currentLoad: 0,
      fuelLevel: 50,
      driver: "Trần Văn Hùng",
      route: "Tuyến 5",
      speed: 0,
      distance: 98500,
      location: "Xưởng bảo trì",
      lastMaintenance: "01/06/2024",
    },
    {
      id: "BUS-04",
      licensePlate: "51B-11223",
      model: "Thaco Town",
      year: 2020,
      status: "ready",
      capacity: 30,
      currentLoad: 0,
      fuelLevel: 100,
      driver: "Võ Minh Tuấn",
      route: "Tuyến 6",
      speed: 0,
      distance: 125600,
      location: "Bãi đỗ trường",
      lastMaintenance: "20/05/2024",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<Bus>>({
    id: "",
    licensePlate: "",
    model: "",
    year: new Date().getFullYear(),
    status: "ready",
    capacity: 0,
    currentLoad: 0,
    fuelLevel: 100,
    driver: "",
    route: "",
    speed: 0,
    distance: 0,
    location: "",
    lastMaintenance: new Date().toLocaleDateString("vi-VN"),
  });

  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState({
    minCapacity: "",
    maxCapacity: "",
    minFuel: "",
    year: "",
    route: "",
  });

  const itemsPerPage = 4;

  // Calculate stats
  const stats = {
    total: buses.length,
    running: buses.filter((b) => b.status === "running").length,
    waiting: buses.filter((b) => b.status === "waiting").length,
    maintenance: buses.filter((b) => b.status === "maintenance").length,
    ready: buses.filter((b) => b.status === "ready").length,
    totalCapacity: buses.reduce((sum, b) => sum + b.capacity, 0),
    registered: buses.reduce((sum, b) => sum + b.currentLoad, 0),
    needMaintenance: buses.filter((b) => b.fuelLevel < 30 || b.distance > 150000).length,
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      running: { text: "Đang chạy", class: "status-badge-running" },
      waiting: { text: "Đang chờ", class: "status-badge-waiting" },
      maintenance: { text: "Bảo trì", class: "status-badge-maintenance" },
      ready: { text: "Sẵn sàng", class: "status-badge-ready" },
    };
    return badges[status as keyof typeof badges] || badges.ready;
  };

  // Filter and sort buses
  const filteredBuses = buses
    .filter((bus) => {
      const matchesSearch =
        bus.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.driver.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterStatus === "all" || bus.status === filterStatus;

      const matchesAdvanced =
        (!advancedFilters.minCapacity || bus.capacity >= parseInt(advancedFilters.minCapacity)) &&
        (!advancedFilters.maxCapacity || bus.capacity <= parseInt(advancedFilters.maxCapacity)) &&
        (!advancedFilters.minFuel || bus.fuelLevel >= parseInt(advancedFilters.minFuel)) &&
        (!advancedFilters.year || bus.year === parseInt(advancedFilters.year)) &&
        (!advancedFilters.route || bus.route.toLowerCase().includes(advancedFilters.route.toLowerCase()));

      return matchesSearch && matchesFilter && matchesAdvanced;
    })
    .sort((a, b) => {
      let aVal: any = a[sortBy as keyof Bus];
      let bVal: any = b[sortBy as keyof Bus];
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredBuses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBuses = filteredBuses.slice(startIndex, startIndex + itemsPerPage);

  // Add bus
  const handleAddBus = () => {
    if (!formData.id || !formData.licensePlate || !formData.model) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const newBus: Bus = {
      id: formData.id!,
      licensePlate: formData.licensePlate!,
      model: formData.model!,
      year: formData.year || new Date().getFullYear(),
      status: formData.status as Bus["status"] || "ready",
      capacity: formData.capacity || 0,
      currentLoad: formData.currentLoad || 0,
      fuelLevel: formData.fuelLevel || 100,
      driver: formData.driver || "",
      route: formData.route || "",
      speed: formData.speed || 0,
      distance: formData.distance || 0,
      location: formData.location || "",
      lastMaintenance: formData.lastMaintenance || new Date().toLocaleDateString("vi-VN"),
    };

    setBuses([...buses, newBus]);
    setShowAddModal(false);
    resetForm();
    alert("Thêm xe thành công!");
  };

  // Edit bus
  const handleEditBus = () => {
    if (!selectedBus) return;

    const updatedBuses = buses.map((bus) =>
      bus.id === selectedBus.id ? { ...bus, ...formData } : bus
    );

    setBuses(updatedBuses);
    setShowEditModal(false);
    setSelectedBus(null);
    resetForm();
    alert("Cập nhật xe thành công!");
  };

  // Delete bus
  const handleDeleteBus = (busId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      setBuses(buses.filter((bus) => bus.id !== busId));
      alert("Xóa xe thành công!");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: "",
      licensePlate: "",
      model: "",
      year: new Date().getFullYear(),
      status: "ready",
      capacity: 0,
      currentLoad: 0,
      fuelLevel: 100,
      driver: "",
      route: "",
      speed: 0,
      distance: 0,
      location: "",
      lastMaintenance: new Date().toLocaleDateString("vi-VN"),
    });
  };

  // Open edit modal
  const openEditModal = (bus: Bus) => {
    setSelectedBus(bus);
    setFormData(bus);
    setShowEditModal(true);
  };

  // Open detail modal
  const openDetailModal = (bus: Bus) => {
    setSelectedBus(bus);
    setShowDetailModal(true);
  };

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
          <div className="stat-icon">📡</div>
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

        <div className="stat-card stat-pink">
          <div className="stat-icon">⚠</div>
          <div className="stat-content">
            <div className="stat-label">Cần bảo trì</div>
            <div className="stat-value">{stats.needMaintenance}</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-bar">
           <Search className="searchIcon w-5 h-5" />
            
          <input
            type="text"
            placeholder="Tìm kiếm theo mã xe, biển số, hãng xe, tài xế..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <button
          className="btn-advanced-filter"
          onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
        >
          <Filter className="w-4 h-4" />
          Tìm kiếm nâng cao
        </button>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedFilter && (
        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px", fontWeight: 600 }}>
            Bộ lọc nâng cao
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280" }}>
                Sức chứa tối thiểu
              </label>
              <input
                type="number"
                value={advancedFilters.minCapacity}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, minCapacity: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px"
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
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxCapacity: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px"
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
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, minFuel: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280" }}>
                Năm sản xuất
              </label>
              <input
                type="number"
                value={advancedFilters.year}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, year: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px"
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
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, route: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px"
                }}
              />
            </div>
          </div>
          <button
            onClick={() => setAdvancedFilters({ minCapacity: "", maxCapacity: "", minFuel: "", year: "", route: "" })}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              background: "#f3f4f6",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          Tất cả
        </button>
        <button
          className={`filter-tab ${filterStatus === "running" ? "active" : ""}`}
          onClick={() => setFilterStatus("running")}
        >
          Đang chạy
        </button>
        <button
          className={`filter-tab ${filterStatus === "waiting" ? "active" : ""}`}
          onClick={() => setFilterStatus("waiting")}
        >
          Đang chờ
        </button>
        <button
          className={`filter-tab ${filterStatus === "maintenance" ? "active" : ""}`}
          onClick={() => setFilterStatus("maintenance")}
        >
          Bảo trì
        </button>
        <button
          className={`filter-tab ${filterStatus === "ready" ? "active" : ""}`}
          onClick={() => setFilterStatus("ready")}
        >
          Sẵn sàng
        </button>
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
                <div className="bus-card-license">{bus.licensePlate}</div>
              </div>

              <div className="bus-model">
                {bus.model} - {bus.year}
              </div>

              <div className="progress-section">
                <div className="progress-item">
                  <div className="progress-label">
                    <span>Sức chứa</span>
                    <span className="progress-value">
                      {bus.currentLoad}/{bus.capacity}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-fill-blue"
                      style={{
                        width: `${(bus.currentLoad / bus.capacity) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="progress-item">
                  <div className="progress-label">
                    <span>Nhiên liệu</span>
                    <span className="progress-value">{bus.fuelLevel}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-fill-green"
                      style={{ width: `${bus.fuelLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bus-info-grid">
                <div className="bus-info-item">
                  <div className="info-label">TÀI XẾ</div>
                  <div className="info-value">{bus.driver}</div>
                </div>
                <div className="bus-info-item">
                  <div className="info-label">TUYẾN ĐƯỜNG</div>
                  <div className="info-value">{bus.route}</div>
                </div>
                <div className="bus-info-item">
                  <div className="info-label">TỐC ĐỘ</div>
                  <div className="info-value">{bus.speed} km/h</div>
                </div>
                <div className="bus-info-item">
                  <div className="info-label">KM ĐÃ ĐI</div>
                  <div className="info-value">{bus.distance.toLocaleString()}</div>
                </div>
              </div>

              <div className="bus-location">
                <span className="location-icon">📍</span>
                <div>
                  <div className="location-label">VỊ TRÍ HIỆN TẠI</div>
                  <div className="location-value">{bus.location}</div>
                </div>
              </div>

              <div className="bus-maintenance">
                <span className="maintenance-icon">🔧</span>
                <span className="maintenance-text">
                  Bảo trì tiếp: {bus.lastMaintenance}
                </span>
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
      {filteredBuses.length > 0 && (
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
          onClick={() => setShowAddModal(false)}
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
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
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
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
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

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Hãng xe *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                    placeholder="VD: Hyundai Universe"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Năm SX
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Sức chứa
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
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Bus["status"] })}
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
                  Tài xế
                </label>
                <input
                  type="text"
                  value={formData.driver}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Tuyến đường
                </label>
                <input
                  type="text"
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="VD: Tuyến 1"
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
                  background: "#3b82f6",
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
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
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
          onClick={() => setShowEditModal(false)}
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
                  Biển số
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Hãng xe
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
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
                    Năm SX
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Sức chứa
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
                    value={formData.currentLoad}
                    onChange={(e) => setFormData({ ...formData, currentLoad: parseInt(e.target.value) })}
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
                    value={formData.fuelLevel}
                    onChange={(e) => setFormData({ ...formData, fuelLevel: parseInt(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Bus["status"] })}
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
                  value={formData.driver}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Tuyến đường
                  </label>
                  <input
                    type="text"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
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
                    Tốc độ (km/h)
                  </label>
                  <input
                    type="number"
                    value={formData.speed}
                    onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) })}
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

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Km đã đi
                </label>
                <input
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) })}
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
                  Bảo trì lần cuối
                </label>
                <input
                  type="text"
                  value={formData.lastMaintenance}
                  onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={handleEditBus}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#3b82f6",
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
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBus(null);
                  resetForm();
                }}
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
          onClick={() => setShowDetailModal(false)}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
                Chi tiết xe {selectedBus.id}
              </h2>
              <span className={`status-badge ${getStatusBadge(selectedBus.status).class}`}>
                <span className="status-dot"></span>
                {getStatusBadge(selectedBus.status).text}
              </span>
            </div>

            <div style={{ display: "grid", gap: "24px" }}>
              {/* Basic Info */}
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#111827" }}>
                  Thông tin cơ bản
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px" }}>
                      BIỂN SỐ
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.licensePlate}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px" }}>
                      HÃNG XE
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.model}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px" }}>
                      NĂM SẢN XUẤT
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.year}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px" }}>
                      SỨC CHỨA
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.capacity} người
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#111827" }}>
                  Trạng thái hiện tại
                </h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px", fontWeight: 600 }}>
                      Số hành khách: {selectedBus.currentLoad}/{selectedBus.capacity}
                    </div>
                    <div style={{ height: "8px", background: "#e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(selectedBus.currentLoad / selectedBus.capacity) * 100}%`,
                          background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
                          borderRadius: "10px",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px", fontWeight: 600 }}>
                      Nhiên liệu: {selectedBus.fuelLevel}%
                    </div>
                    <div style={{ height: "8px", background: "#e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${selectedBus.fuelLevel}%`,
                          background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                          borderRadius: "10px",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operation Info */}
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#111827" }}>
                  Thông tin vận hành
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px" }}>
                      TÀI XẾ
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.driver}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px" }}>
                      TUYẾN ĐƯỜNG
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.route}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px" }}>
                      TỐC ĐỘ
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.speed} km/h
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px" }}>
                      QUÃNG ĐƯỜNG ĐÃ ĐI
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.distance.toLocaleString()} km
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Maintenance */}
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#111827" }}>
                  Vị trí & Bảo trì
                </h3>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px", background: "#f9fafb", borderRadius: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "20px" }}>📍</span>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px" }}>
                      VỊ TRÍ HIỆN TẠI
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                      {selectedBus.location}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "#f9fafb", borderRadius: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🔧</span>
                  <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>
                    Bảo trì lần cuối: {selectedBus.lastMaintenance}
                  </span>
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
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBus(null);
                }}
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