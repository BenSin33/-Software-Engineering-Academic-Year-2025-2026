"use client";

import { useState, useEffect, useMemo } from "react";
import "./BusesPage.css";
import { Filter, Search } from "lucide-react";

// 1. CẬP NHẬT: Interface này đã được cập nhật để khớp với CSDL
interface Bus {
  id: string;
  license_plate: string;
  model: string;
  year: number;
  status: "running" | "waiting" | "maintenance" | "ready";
  capacity: number;
  current_load: number;
  fuel_level: number;
  driver_name: string;
  route_id: string;
  speed: number;
  distance: number;
  location: string;
  last_maintenance: string; // Sẽ có dạng 'YYYY-MM-DD' từ CSDL
}

// 2. THÊM MỚI: Hàm tiện ích để format ngày tháng
// Chuyển 'YYYY-MM-DD' thành 'DD/MM/YYYY'
const formatDisplayDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("vi-VN");
  } catch (error) {
    return "N/A";
  }
};

// Chuyển 'DD/MM/YYYY' thành 'YYYY-MM-DD' để gửi cho API
const formatApiDate = (dateString: string) => {
  if (!dateString || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    return new Date().toISOString().split("T")[0]; // Mặc định là hôm nay
  }
  try {
    const parts = dateString.split("/");
    const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return date.toISOString().split("T")[0];
  } catch (error) {
    return new Date().toISOString().split("T")[0];
  }
};

export default function BusesPage() {
  // 3. CẬP NHẬT: Khởi tạo mảng rỗng, dữ liệu sẽ được fetch từ API
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
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

  // 4. CẬP NHẬT: Đổi tên trường để khớp với CSDL
  const initialFormData: Partial<Bus> = {
    id: "",
    license_plate: "",
    model: "",
    year: new Date().getFullYear(),
    status: "ready",
    capacity: 0,
    current_load: 0,
    fuel_level: 100,
    driver_name: "",
    route_id: "",
    speed: 0,
    distance: 0,
    location: "",
    last_maintenance: new Date().toISOString().split("T")[0],
  };

  const [formData, setFormData] = useState<Partial<Bus>>(initialFormData);

  const [advancedFilters, setAdvancedFilters] = useState({
    minCapacity: "",
    maxCapacity: "",
    minFuel: "",
    year: "",
    route: "",
  });

  const itemsPerPage = 4;
  const API_URL = "http://localhost:3002/api"; // URL của bus_service

  // 5. THÊM MỚI: Hàm fetch dữ liệu
  const fetchBuses = async () => {
    setLoading(true);
    try {
      // Ví dụ: gọi API với phân trang và bộ lọc (nếu backend hỗ trợ)
      // Hiện tại, chúng ta fetch tất cả
      const response = await fetch(`${API_URL}/buses?limit=1000`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách xe");
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setBuses(result.data);
      } else {
        setBuses([]);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tải dữ liệu xe buýt.");
      setBuses([]); // Xóa dữ liệu cũ nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  // 6. THÊM MỚI: Gọi fetchBuses khi component được tải
  useEffect(() => {
    fetchBuses();
  }, []);

  // 7. CẬP NHẬT: Tối ưu hóa tính toán bằng useMemo
  const stats = useMemo(() => {
    return {
      total: buses.length,
      running: buses.filter((b) => b.status === "running").length,
      waiting: buses.filter((b) => b.status === "waiting").length,
      maintenance: buses.filter((b) => b.status === "maintenance").length,
      ready: buses.filter((b) => b.status === "ready").length,
      totalCapacity: buses.reduce((sum, b) => sum + b.capacity, 0),
      registered: buses.reduce((sum, b) => sum + b.current_load, 0),
      needMaintenance: buses.filter(
        (b) =>
          b.fuel_level < 30 ||
          b.distance > 150000 ||
          (new Date().getTime() - new Date(b.last_maintenance).getTime()) / (1000 * 3600 * 24) > 90
      ).length,
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

  // 8. CẬP NHẬT: Tối ưu hóa filter/sort bằng useMemo
  const filteredBuses = useMemo(() => {
    return buses
      .filter((bus) => {
        const matchesSearch =
          bus.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bus.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bus.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bus.driver_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === "all" || bus.status === filterStatus;

        const matchesAdvanced =
          (!advancedFilters.minCapacity || bus.capacity >= parseInt(advancedFilters.minCapacity)) &&
          (!advancedFilters.maxCapacity || bus.capacity <= parseInt(advancedFilters.maxCapacity)) &&
          (!advancedFilters.minFuel || bus.fuel_level >= parseInt(advancedFilters.minFuel)) &&
          (!advancedFilters.year || bus.year === parseInt(advancedFilters.year)) &&
          (!advancedFilters.route || bus.route_id.toLowerCase().includes(advancedFilters.route.toLowerCase()));

        return matchesSearch && matchesFilter && matchesAdvanced;
      })
      .sort((a, b) => {
        type FieldValue = string | number | undefined;

        const aRaw = a[sortBy as keyof Bus];
        const bRaw = b[sortBy as keyof Bus];

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

        // Fallback: compare string representations
        const aStr = String(aVal);
        const bStr = String(bVal);
        if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
        if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [buses, searchTerm, filterStatus, advancedFilters, sortBy, sortOrder]);

  // 9. CẬP NHẬT: Tối ưu hóa phân trang bằng useMemo
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

  // 10. CẬP NHẬT: Viết lại hàm Add để gọi API
  const handleAddBus = async () => {
    // Client-side validation
    if (!formData.id || !formData.license_plate || !formData.model || !formData.capacity) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc (Mã xe, Biển số, Hãng xe, Sức chứa)!");
      return;
    }

    const newBusData = {
      ...initialFormData, // Đảm bảo có đủ các trường
      ...formData,
      capacity: Number(formData.capacity) || 0,
      year: Number(formData.year) || new Date().getFullYear(),
      fuel_level: Number(formData.fuel_level) || 100,
      last_maintenance: formData.last_maintenance ? formatApiDate(formData.last_maintenance) : new Date().toISOString().split("T")[0],
    };

    try {
      const response = await fetch(`${API_URL}/buses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBusData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Lỗi khi thêm xe");
      }

      alert("Thêm xe thành công!");
      setShowAddModal(false);
      resetForm();
      fetchBuses(); // Tải lại danh sách
    } catch (error: any) {
      console.error(error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  // 11. CẬP NHẬT: Viết lại hàm Edit để gọi API
  const handleEditBus = async () => {
    if (!selectedBus) return;

    // Chỉ gửi các trường đã thay đổi (hoặc toàn bộ form)
    const updatedData = {
      ...formData,
      capacity: Number(formData.capacity) || 0,
      year: Number(formData.year) || new Date().getFullYear(),
      fuel_level: Number(formData.fuel_level) || 100,
      current_load: Number(formData.current_load) || 0,
      speed: Number(formData.speed) || 0,
      distance: Number(formData.distance) || 0,
      last_maintenance: formData.last_maintenance ? formatApiDate(formData.last_maintenance) : new Date().toISOString().split("T")[0],
    };

    try {
      const response = await fetch(`${API_URL}/buses/${selectedBus.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Lỗi khi cập nhật xe");
      }

      alert("Cập nhật xe thành công!");
      setShowEditModal(false);
      resetForm();
      fetchBuses(); // Tải lại danh sách
    } catch (error: any) {
      console.error(error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  // 12. CẬP NHẬT: Viết lại hàm Delete để gọi API
  const handleDeleteBus = async (busId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      try {
        const response = await fetch(`${API_URL}/buses/${busId}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Lỗi khi xóa xe");
        }

        alert("Xóa xe thành công!");
        fetchBuses(); // Tải lại danh sách
      } catch (error: any) {
        console.error(error);
        alert(`Lỗi: ${error.message}`);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedBus(null);
  };

  // Open edit modal
  const openEditModal = (bus: Bus) => {
    setSelectedBus(bus);
    // Chuyển ngày YYYY-MM-DD sang DD/MM/YYYY để hiển thị
    setFormData({ ...bus, last_maintenance: formatDisplayDate(bus.last_maintenance) });
    setShowEditModal(true);
  };

  // Open detail modal
  const openDetailModal = (bus: Bus) => {
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
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã xe, biển số, hãng xe, tài xế..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
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
                Năm sản xuất
              </label>
              <input
                type="number"
                value={advancedFilters.year}
                onChange={(e) => {
                  setAdvancedFilters({ ...advancedFilters, year: e.target.value });
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
              setAdvancedFilters({ minCapacity: "", maxCapacity: "", minFuel: "", year: "", route: "" });
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
              setCurrentPage(1); // Reset về trang 1
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

              <div className="bus-model">
                {bus.model} - {bus.year}
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
                  <div className="location-value">{bus.location || "N/A"}</div>
                </div>
              </div>

              <div className="bus-maintenance">
                <span className="maintenance-icon">🔧</span>
                <span className="maintenance-text">
                  Bảo trì lần cuối: {formatDisplayDate(bus.last_maintenance)}
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
            {/* Chỉ hiển thị một vài trang nếu có quá nhiều */}
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
          // 13. SỬA LỖI: Gọi handleCloseAddModal khi nhấn nền mờ
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
            {/* Form (sử dụng các trường đã đổi tên) */}
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
                    Năm SX *
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
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
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
                  value={formData.route_id}
                  onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="VD: ROUTE-01"
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

              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                  Bảo trì lần cuối
                </label>
                <input
                  type="text"
                  value={formData.last_maintenance}
                  onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })}
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
                onClick={handleAddBus}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#FFAC50", // Đổi màu
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
          // 14. SỬA LỖI: Gọi handleCloseEditModal khi nhấn nền mờ
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
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#6b7280", fontWeight: 600 }}>
                    Năm SX *
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                  value={formData.last_maintenance}
                  onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })}
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
                  background: "#FFAC50", // Đổi màu
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
          // 15. SỬA LỖI: Gọi handleCloseDetailModal khi nhấn nền mờ
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
              {/* Basic Info */}
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
                      HÃNG XE
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.model}
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
                      NĂM SẢN XUẤT
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.year}
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

              {/* Current Status */}
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

              {/* Operation Info */}
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
                      TỐC ĐỘ
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                      {selectedBus.speed} km/h
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
                <h3
                  style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#111827" }}
                >
                  Vị trí & Bảo trì
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

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🔧</span>
                  <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>
                    Bảo trì lần cuối: {formatDisplayDate(selectedBus.last_maintenance)}
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
                  background: "#FFAC50", // Đổi màu
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