"use client";

import { useState, useMemo } from "react";
import { 
  UserCircle, Phone, Mail, Calendar, MapPin, AlertTriangle, 
  CheckCircle, Clock, Search, Plus, Edit, Trash2, Eye, 
  Filter, ChevronLeft, ChevronRight, X 
} from "lucide-react";
import "./DriversPage.css";

interface Driver {
  id: number;
  name: string;
  phone: string;
  email: string;
  license: string;
  bus: string;
  route: string;
  status: "active" | "rest";
  experience: string;
  trips: number;
  rating: number;
  avatar: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  license: string;
  bus: string;
  route: string;
  experience: string;
  rating: number;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: 1,
      name: "Nguyễn Văn An",
      phone: "0901234567",
      email: "nva@school.edu.vn",
      license: "B2-123456",
      bus: "BUS-01",
      route: "Tuyến 1",
      status: "active",
      experience: "5 năm",
      trips: 1250,
      rating: 4.8,
      avatar: "A"
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      phone: "0912345678",
      email: "ttb@school.edu.vn",
      license: "B2-234567",
      bus: "BUS-03",
      route: "Tuyến 2",
      status: "active",
      experience: "3 năm",
      trips: 890,
      rating: 4.9,
      avatar: "B"
    },
    {
      id: 3,
      name: "Lê Văn Cường",
      phone: "0923456789",
      email: "lvc@school.edu.vn",
      license: "B2-345678",
      bus: "BUS-05",
      route: "Tuyến 3",
      status: "rest",
      experience: "7 năm",
      trips: 1560,
      rating: 4.7,
      avatar: "C"
    },
    {
      id: 4,
      name: "Phạm Thị Dung",
      phone: "0934567890",
      email: "ptd@school.edu.vn",
      license: "B2-456789",
      bus: "BUS-07",
      route: "Tuyến 4",
      status: "active",
      experience: "4 năm",
      trips: 1100,
      rating: 4.6,
      avatar: "D"
    },
    {
      id: 5,
      name: "Hoàng Văn Em",
      phone: "0945678901",
      email: "hve@school.edu.vn",
      license: "B2-567890",
      bus: "-",
      route: "-",
      status: "rest",
      experience: "2 năm",
      trips: 520,
      rating: 4.5,
      avatar: "E"
    },
    {
      id: 6,
      name: "Đỗ Thị Phương",
      phone: "0956789012",
      email: "dtp@school.edu.vn",
      license: "B2-678901",
      bus: "BUS-12",
      route: "Tuyến 5",
      status: "active",
      experience: "6 năm",
      trips: 1420,
      rating: 4.9,
      avatar: "P"
    },
    {
      id: 7,
      name: "Vũ Văn Giang",
      phone: "0967890123",
      email: "vvg@school.edu.vn",
      license: "B2-789012",
      bus: "BUS-02",
      route: "Tuyến 1",
      status: "active",
      experience: "8 năm",
      trips: 1680,
      rating: 4.8,
      avatar: "G"
    },
    {
      id: 8,
      name: "Bùi Thị Hoa",
      phone: "0978901234",
      email: "bth@school.edu.vn",
      license: "B2-890123",
      bus: "BUS-04",
      route: "Tuyến 2",
      status: "active",
      experience: "3 năm",
      trips: 920,
      rating: 4.7,
      avatar: "H"
    },
    {
      id: 9,
      name: "Đặng Văn Inh",
      phone: "0989012345",
      email: "dvi@school.edu.vn",
      license: "B2-901234",
      bus: "BUS-06",
      route: "Tuyến 3",
      status: "rest",
      experience: "5 năm",
      trips: 1340,
      rating: 4.6,
      avatar: "I"
    },
    {
      id: 10,
      name: "Ngô Thị Kiều",
      phone: "0990123456",
      email: "ntk@school.edu.vn",
      license: "B2-012345",
      bus: "BUS-08",
      route: "Tuyến 4",
      status: "active",
      experience: "4 năm",
      trips: 1050,
      rating: 4.8,
      avatar: "K"
    },
    {
      id: 11,
      name: "Lương Văn Long",
      phone: "0901234568",
      email: "lvl@school.edu.vn",
      license: "B2-123457",
      bus: "BUS-09",
      route: "Tuyến 5",
      status: "active",
      experience: "6 năm",
      trips: 1480,
      rating: 4.9,
      avatar: "L"
    },
    {
      id: 12,
      name: "Cao Thị Mai",
      phone: "0912345679",
      email: "ctm@school.edu.vn",
      license: "B2-234568",
      bus: "BUS-10",
      route: "Tuyến 1",
      status: "rest",
      experience: "2 năm",
      trips: 650,
      rating: 4.5,
      avatar: "M"
    }
  ]);

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
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    license: "",
    bus: "",
    route: "",
    experience: "",
    rating: 5
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    name: "",
    phone: "",
    email: "",
    license: "",
    bus: "",
    route: "",
    minRating: "",
    maxRating: "",
    minExperience: "",
    maxExperience: ""
  });

  const itemsPerPage = 5;

  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      const matchesBasicSearch = 
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm) ||
        driver.license.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || driver.status === filterStatus;
      
      const matchesName = !advancedFilters.name || 
        driver.name.toLowerCase().includes(advancedFilters.name.toLowerCase());
      
      const matchesPhone = !advancedFilters.phone || 
        driver.phone.includes(advancedFilters.phone);
      
      const matchesEmail = !advancedFilters.email || 
        driver.email.toLowerCase().includes(advancedFilters.email.toLowerCase());
      
      const matchesLicense = !advancedFilters.license || 
        driver.license.toLowerCase().includes(advancedFilters.license.toLowerCase());
      
      const matchesBus = !advancedFilters.bus || 
        driver.bus.toLowerCase().includes(advancedFilters.bus.toLowerCase());
      
      const matchesRoute = !advancedFilters.route || 
        driver.route.toLowerCase().includes(advancedFilters.route.toLowerCase());
      
      const experienceYears = parseInt(driver.experience);
      const matchesMinExp = !advancedFilters.minExperience || 
        experienceYears >= parseInt(advancedFilters.minExperience);
      const matchesMaxExp = !advancedFilters.maxExperience || 
        experienceYears <= parseInt(advancedFilters.maxExperience);
      
      const matchesMinRating = !advancedFilters.minRating || 
        driver.rating >= parseFloat(advancedFilters.minRating);
      const matchesMaxRating = !advancedFilters.maxRating || 
        driver.rating <= parseFloat(advancedFilters.maxRating);

      return matchesBasicSearch && matchesStatus && matchesName && 
             matchesPhone && matchesEmail && matchesLicense && 
             matchesBus && matchesRoute && matchesMinExp && 
             matchesMaxExp && matchesMinRating && matchesMaxRating;
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
    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter(d => d.status === "active").length;
    const restDrivers = drivers.filter(d => d.status === "rest").length;
    const avgRating = totalDrivers > 0 
      ? (drivers.reduce((sum, d) => sum + d.rating, 0) / totalDrivers).toFixed(1) 
      : "0";

    return [
      { label: "Tổng số tài xế", value: totalDrivers.toString(), color: "bg-blue-500", icon: UserCircle },
      { label: "Đang hoạt động", value: activeDrivers.toString(), color: "bg-green-500", icon: CheckCircle },
      { label: "Đang nghỉ", value: restDrivers.toString(), color: "bg-yellow-500", icon: Clock },
      { label: "Đánh giá trung bình", value: `${avgRating}⭐`, color: "bg-purple-500", icon: AlertTriangle }
    ];
  }, [drivers]);

  const handleAdvancedSearch = () => {
    setCurrentPage(1);
  };

  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      name: "",
      phone: "",
      email: "",
      license: "",
      bus: "",
      route: "",
      minRating: "",
      maxRating: "",
      minExperience: "",
      maxExperience: ""
    });
    setCurrentPage(1);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      license: "",
      bus: "",
      route: "",
      experience: "",
      rating: 5
    });
  };

  const handleAddDriver = () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.license) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const newDriver: Driver = {
      id: Math.max(...drivers.map(d => d.id), 0) + 1,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      license: formData.license,
      bus: formData.bus || "-",
      route: formData.route || "-",
      status: "active",
      experience: formData.experience || "0 năm",
      trips: 0,
      rating: formData.rating,
      avatar: formData.name.charAt(0).toUpperCase()
    };

    setDrivers([...drivers, newDriver]);
    setShowAddModal(false);
    resetForm();
    alert("Thêm tài xế thành công!");
  };

  const handleEditClick = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      license: driver.license,
      bus: driver.bus === "-" ? "" : driver.bus,
      route: driver.route === "-" ? "" : driver.route,
      experience: driver.experience,
      rating: driver.rating
    });
    setShowEditModal(true);
  };

  const handleUpdateDriver = () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.license) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (!editingDriver) return;

    const updatedDrivers = drivers.map(driver => {
      if (driver.id === editingDriver.id) {
        return {
          ...driver,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          license: formData.license,
          bus: formData.bus || "-",
          route: formData.route || "-",
          experience: formData.experience,
          rating: formData.rating,
          avatar: formData.name.charAt(0).toUpperCase()
        };
      }
      return driver;
    });

    setDrivers(updatedDrivers);
    setShowEditModal(false);
    setEditingDriver(null);
    resetForm();
    alert("Cập nhật thông tin tài xế thành công!");
  };

  const handleDeleteClick = (id: number) => {
    setDeletingDriverId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deletingDriverId !== null) {
      setDrivers(drivers.filter(driver => driver.id !== deletingDriverId));
      setShowDeleteConfirm(false);
      setDeletingDriverId(null);
      alert("Xóa tài xế thành công!");
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
        <button className="addButton" onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5" />
          Thêm tài xế mới
        </button>
      </div>

      {/* Stats */}
      <div className="statsGrid">
        {stats.map((stat, index) => (
          <div key={index} className="statCard">
            <div className="statContent">
              <p>{stat.label}</p>
              <p>{stat.value}</p>
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
                <label>Giấy phép lái xe</label>
                <input
                  type="text"
                  placeholder="Nhập số giấy phép..."
                  value={advancedFilters.license}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, license: e.target.value})}
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
                  placeholder="VD: Tuyến 1"
                  value={advancedFilters.route}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, route: e.target.value})}
                />
              </div>
              <div className="formGroup">
                <label>Kinh nghiệm tối thiểu (năm)</label>
                <input
                  type="number"
                  placeholder="VD: 2"
                  min="0"
                  value={advancedFilters.minExperience}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, minExperience: e.target.value})}
                />
              </div>
              <div className="formGroup">
                <label>Kinh nghiệm tối đa (năm)</label>
                <input
                  type="number"
                  placeholder="VD: 10"
                  min="0"
                  value={advancedFilters.maxExperience}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, maxExperience: e.target.value})}
                />
              </div>
              <div className="formGroup">
                <label>Đánh giá tối thiểu</label>
                <input
                  type="number"
                  placeholder="VD: 4.0"
                  min="0"
                  max="5"
                  step="0.1"
                  value={advancedFilters.minRating}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, minRating: e.target.value})}
                />
              </div>
              <div className="formGroup">
                <label>Đánh giá tối đa</label>
                <input
                  type="number"
                  placeholder="VD: 5.0"
                  min="0"
                  max="5"
                  step="0.1"
                  value={advancedFilters.maxRating}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, maxRating: e.target.value})}
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
          {currentDrivers.length > 0 ? (
            <table className="table">
              <thead className="tableHeader">
                <tr>
                  <th>Tài xế</th>
                  <th>Liên hệ</th>
                  <th>Giấy phép</th>
                  <th>Xe/Tuyến</th>
                  <th>Kinh nghiệm</th>
                  <th>Trạng thái</th>
                  <th>Đánh giá</th>
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
                          <div className="driverTrips">{driver.trips} chuyến</div>
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
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {driver.license}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{driver.bus}</div>
                        <div style={{ color: '#6b7280' }}>{driver.route}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.875rem' }}>{driver.experience}</span>
                    </td>
                    <td>{getStatusBadge(driver.status)}</td>
                    <td>
                      <div className="rating">
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                          {driver.rating}
                        </span>
                        <span style={{ color: '#eab308' }}>⭐</span>
                      </div>
                    </td>
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
                pageNum === 1 ||
                pageNum === totalPages ||
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
              } else if (
                pageNum === currentPage - 2 ||
                pageNum === currentPage + 2
              ) {
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

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div className="modal" onClick={() => setSelectedDriver(null)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalHeaderContent">
                <div className="modalAvatar">{selectedDriver.avatar}</div>
                <div>
                  <h2 className="modalTitle">{selectedDriver.name}</h2>
                  <p className="modalSubtitle">{selectedDriver.license}</p>
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
                  <label>Kinh nghiệm</label>
                  <div className="value">{selectedDriver.experience}</div>
                </div>
                <div className="detailItem">
                  <label>Tổng số chuyến</label>
                  <div className="value">{selectedDriver.trips} chuyến</div>
                </div>
                <div className="detailItem">
                  <label>Đánh giá</label>
                  <div className="value">{selectedDriver.rating} ⭐</div>
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

      {/* Add Driver Modal */}
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
                  <label>Giấy phép lái xe *</label>
                  <input
                    type="text"
                    placeholder="VD: B2-123456"
                    value={formData.license}
                    onChange={(e) => setFormData({...formData, license: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Xe buýt</label>
                  <input
                    type="text"
                    placeholder="VD: BUS-01"
                    value={formData.bus}
                    onChange={(e) => setFormData({...formData, bus: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Tuyến đường</label>
                  <input
                    type="text"
                    placeholder="VD: Tuyến 1"
                    value={formData.route}
                    onChange={(e) => setFormData({...formData, route: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Kinh nghiệm</label>
                  <input
                    type="text"
                    placeholder="VD: 5 năm"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Đánh giá ban đầu</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                  />
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

      {/* Edit Driver Modal */}
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
                  <label>Giấy phép lái xe *</label>
                  <input
                    type="text"
                    placeholder="VD: B2-123456"
                    value={formData.license}
                    onChange={(e) => setFormData({...formData, license: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Xe buýt</label>
                  <input
                    type="text"
                    placeholder="VD: BUS-01"
                    value={formData.bus}
                    onChange={(e) => setFormData({...formData, bus: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Tuyến đường</label>
                  <input
                    type="text"
                    placeholder="VD: Tuyến 1"
                    value={formData.route}
                    onChange={(e) => setFormData({...formData, route: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Kinh nghiệm</label>
                  <input
                    type="text"
                    placeholder="VD: 5 năm"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  />
                </div>
                <div className="formGroup">
                  <label>Đánh giá</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                  />
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
                Hành động này không thể hoàn tác. Tất cả thông tin của tài xế sẽ bị xóa vĩnh viễn.
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