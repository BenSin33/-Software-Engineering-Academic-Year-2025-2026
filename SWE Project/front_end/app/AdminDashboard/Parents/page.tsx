"use client";

import React, { useState, ReactElement } from "react";
import { Users, Phone, Mail, MapPin, UserCircle, Search, Plus, Edit, Trash2, Eye, MessageSquare, Bell, BellOff, CheckCircle, XCircle, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import "@/app/AdminDashboard/Parents/ParentsPage.css";

interface Student {
  id: number;
  name: string;
  grade: string;
  bus: string;
}

interface Parent {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  students: Student[];
  status: string;
  notification: boolean;
  registeredDate: string;
  avatar: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  notification: boolean;
}

interface AdvancedFilters {
  phone: string;
  address: string;
  bus: string;
  grade: string;
}

export default function ParentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    phone: "",
    address: "",
    bus: "",
    grade: ""
  });
  
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageParent, setMessageParent] = useState<Parent | null>(null);
  const [messageContent, setMessageContent] = useState("");

  const [parents, setParents] = useState<Parent[]>([
    {
      id: 1,
      name: "Nguyễn Thị Lan",
      phone: "0901234567",
      email: "ntl@gmail.com",
      address: "123 Nguyễn Văn Cừ, Q.5, TP.HCM",
      students: [
        { id: 1, name: "Nguyễn Minh An", grade: "Lớp 3A", bus: "BUS-01" }
      ],
      status: "active",
      notification: true,
      registeredDate: "15/01/2024",
      avatar: "L"
    },
    {
      id: 2,
      name: "Trần Văn Bình",
      phone: "0912345678",
      email: "tvb@gmail.com",
      address: "456 Lê Văn Sỹ, Q.3, TP.HCM",
      students: [
        { id: 2, name: "Trần Thảo My", grade: "Lớp 5B", bus: "BUS-03" }
      ],
      status: "active",
      notification: true,
      registeredDate: "20/01/2024",
      avatar: "B"
    },
    {
      id: 3,
      name: "Lê Thị Cúc",
      phone: "0923456789",
      email: "ltc@gmail.com",
      address: "789 Võ Văn Tần, Q.3, TP.HCM",
      students: [
        { id: 3, name: "Lê Hoàng Nam", grade: "Lớp 2C", bus: "BUS-05" },
        { id: 4, name: "Lê Hoàng Anh", grade: "Lớp 4A", bus: "BUS-05" }
      ],
      status: "active",
      notification: false,
      registeredDate: "10/02/2024",
      avatar: "C"
    },
    {
      id: 4,
      name: "Phạm Văn Dũng",
      phone: "0934567890",
      email: "pvd@gmail.com",
      address: "321 Pasteur, Q.1, TP.HCM",
      students: [
        { id: 5, name: "Phạm Quỳnh Anh", grade: "Lớp 1A", bus: "BUS-07" }
      ],
      status: "inactive",
      notification: true,
      registeredDate: "05/03/2024",
      avatar: "D"
    },
    {
      id: 5,
      name: "Hoàng Thị Em",
      phone: "0945678901",
      email: "hte@gmail.com",
      address: "654 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM",
      students: [
        { id: 6, name: "Hoàng Minh Khang", grade: "Lớp 3B", bus: "BUS-12" }
      ],
      status: "active",
      notification: true,
      registeredDate: "12/02/2024",
      avatar: "E"
    },
    {
      id: 6,
      name: "Đỗ Văn Phúc",
      phone: "0956789012",
      email: "dvp@gmail.com",
      address: "987 Cách Mạng Tháng 8, Q.10, TP.HCM",
      students: [
        { id: 7, name: "Đỗ Khánh Linh", grade: "Lớp 4C", bus: "BUS-01" }
      ],
      status: "active",
      notification: true,
      registeredDate: "18/01/2024",
      avatar: "P"
    },
    {
      id: 7,
      name: "Vũ Thị Giang",
      phone: "0967890123",
      email: "vtg@gmail.com",
      address: "234 Trần Hưng Đạo, Q.1, TP.HCM",
      students: [
        { id: 8, name: "Vũ Minh Tuấn", grade: "Lớp 5A", bus: "BUS-03" }
      ],
      status: "active",
      notification: true,
      registeredDate: "22/02/2024",
      avatar: "G"
    },
    {
      id: 8,
      name: "Bùi Văn Hùng",
      phone: "0978901234",
      email: "bvh@gmail.com",
      address: "567 Hai Bà Trưng, Q.3, TP.HCM",
      students: [
        { id: 9, name: "Bùi Thu Hà", grade: "Lớp 2A", bus: "BUS-05" }
      ],
      status: "active",
      notification: false,
      registeredDate: "08/03/2024",
      avatar: "H"
    }
  ]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    notification: true
  });

  const itemsPerPage = 6;

  const filteredParents = parents.filter(parent => {
    const matchesSearch = parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parent.phone.includes(searchTerm) ||
                         parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parent.students.some(student => 
                           student.name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesPhone = advancedFilters.phone === "" || 
                         parent.phone.includes(advancedFilters.phone);
    
    const matchesAddress = advancedFilters.address === "" || 
                          parent.address.toLowerCase().includes(advancedFilters.address.toLowerCase());
    
    const matchesBus = advancedFilters.bus === "" ||
                       parent.students.some(student => 
                         student.bus.toLowerCase().includes(advancedFilters.bus.toLowerCase())
                       );
    
    const matchesGrade = advancedFilters.grade === "" ||
                        parent.students.some(student => 
                          student.grade.toLowerCase().includes(advancedFilters.grade.toLowerCase())
                        );
    
    const matchesFilter = filterStatus === "all" || parent.status === filterStatus;
    
    return matchesSearch && matchesFilter && matchesPhone && matchesAddress && matchesBus && matchesGrade;
  });

  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParents = filteredParents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      phone: "",
      address: "",
      bus: "",
      grade: ""
    });
  };

  const handleAddParent = () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const newParent: Parent = {
      id: parents.length + 1,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      students: [],
      status: "active",
      notification: formData.notification,
      registeredDate: new Date().toLocaleDateString('vi-VN'),
      avatar: formData.name.charAt(0).toUpperCase()
    };

    setParents([...parents, newParent]);
    setShowAddModal(false);
    setFormData({ name: "", phone: "", email: "", address: "", notification: true });
    alert("Thêm phụ huynh thành công!");
  };

  const handleEditParent = () => {
    if (!selectedParent) return;

    const updatedParents = parents.map(p => 
      p.id === selectedParent.id ? { 
        ...selectedParent,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        notification: formData.notification
      } : p
    );

    setParents(updatedParents);
    setShowEditModal(false);
    setSelectedParent(null);
    setFormData({ name: "", phone: "", email: "", address: "", notification: true });
    alert("Cập nhật thông tin thành công!");
  };

  const handleDeleteParent = () => {
    if (!parentToDelete) return;

    setParents(parents.filter(p => p.id !== parentToDelete.id));
    setShowDeleteConfirm(false);
    setParentToDelete(null);
    alert("Xóa phụ huynh thành công!");
  };

  const openEditModal = (parent: Parent) => {
    setSelectedParent(parent);
    setFormData({
      name: parent.name,
      phone: parent.phone,
      email: parent.email,
      address: parent.address,
      notification: parent.notification
    });
    setShowEditModal(true);
  };

  const openMessageModal = (parent: Parent) => {
    setMessageParent(parent);
    setShowMessageModal(true);
  };

  const handleSendMessage = () => {
    if (!messageContent.trim()) {
      alert("Vui lòng nhập nội dung tin nhắn!");
      return;
    }
    alert(`Đã gửi tin nhắn đến ${messageParent?.name}`);
    setShowMessageModal(false);
    setMessageContent("");
    setMessageParent(null);
  };

  const handleToggleNotification = (parentId: number) => {
    setParents(parents.map(p => 
      p.id === parentId ? { ...p, notification: !p.notification } : p
    ));
  };

  const getStatusBadge = (status: string): ReactElement => {
    switch(status) {
      case "active":
        return (
          <span className="status-badge status-active">
            <CheckCircle className="status-icon" /> Đang sử dụng
          </span>
        );
      case "inactive":
        return (
          <span className="status-badge status-inactive">
            <XCircle className="status-icon" /> Không hoạt động
          </span>
        );
      default:
        return (
          <span className="status-badge status-unknown">
            Không rõ
          </span>
        );
    }
  };

  const stats = [
    { label: "1234567890", value: parents.length.toString(), color: "stat-purple", icon: Users },
    { label: "123456789", value: parents.filter(p => p.status === "active").length.toString(), color: "stat-green", icon: CheckCircle },
    { label: "123456789", value: parents.filter(p => p.notification).length.toString(), color: "stat-blue", icon: Bell },
    { label: "12345678", value: "+24", color: "stat-orange", icon: UserCircle }
  ];

  return (
    <div className="parents-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Phụ huynh</h1>
          <p className="page-subtitle">Quản lý thông tin phụ huynh và học sinh</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-add">
          <Plus className="btn-icon" />
          Thêm phụ huynh mới
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-content">
              <div>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
              <div className={`stat-icon-wrapper ${stat.color}`}>
                <stat.icon className="stat-icon" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="filter-section">
        <div className="search-row">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên phụ huynh, học sinh, số điện thoại, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={`btn-filter ${showAdvancedSearch ? 'active' : ''}`}
          >
            <Filter className="btn-icon" />
            Tìm kiếm nâng cao
          </button>
        </div>

        {/* Advanced Search */}
        {showAdvancedSearch && (
          <div className="advanced-search">
            <div className="advanced-grid">
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="VD: 0901234567"
                  value={advancedFilters.phone}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, phone: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ</label>
                <input
                  type="text"
                  placeholder="VD: Q.1, Q.3, TP.HCM"
                  value={advancedFilters.address}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, address: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Xe buýt</label>
                <input
                  type="text"
                  placeholder="VD: BUS-01"
                  value={advancedFilters.bus}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, bus: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Lớp học</label>
                <input
                  type="text"
                  placeholder="VD: Lớp 3A"
                  value={advancedFilters.grade}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, grade: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
            <button onClick={clearAdvancedFilters} className="btn-clear">
              Xóa bộ lọc
            </button>
          </div>
        )}

        <div className="status-filters">
          <button
            onClick={() => setFilterStatus("all")}
            className={`filter-btn ${filterStatus === "all" ? 'active' : ''}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`filter-btn ${filterStatus === "active" ? 'active-status' : ''}`}
          >
            Đang sử dụng
          </button>
          <button
            onClick={() => setFilterStatus("inactive")}
            className={`filter-btn ${filterStatus === "inactive" ? 'inactive-status' : ''}`}
          >
            Không hoạt động
          </button>
        </div>
      </div>

      {/* Parents Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="parents-table">
            <thead>
              <tr>
                <th>Phụ huynh</th>
                <th>Liên hệ</th>
                <th>Địa chỉ</th>
                <th>Học sinh</th>
                <th>Ngày đăng ký</th>
                <th>Thông báo</th>
                <th>Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentParents.length > 0 ? (
                currentParents.map((parent) => (
                  <tr key={parent.id}>
                    <td>
                      <div className="parent-info">
                        <div className="avatar">
                          {parent.avatar}
                        </div>
                        <div>
                          <p className="parent-name">{parent.name}</p>
                          <p className="student-count">{parent.students.length} học sinh</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-item">
                          <Phone className="contact-icon" />
                          {parent.phone}
                        </div>
                        <div className="contact-item email">
                          <Mail className="contact-icon" />
                          {parent.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="address-info">
                        <MapPin className="address-icon" />
                        <span>{parent.address}</span>
                      </div>
                    </td>
                    <td>
                      <div className="students-list">
                        {parent.students.map((student) => (
                          <div key={student.id} className="student-item">
                            <p className="student-name">{student.name}</p>
                            <p className="student-details">{student.grade} - {student.bus}</p>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="date-text">{parent.registeredDate}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleNotification(parent.id)}
                        className="notification-toggle"
                      >
                        {parent.notification ? (
                          <>
                            <Bell className="notif-icon active" />
                            <span className="notif-text active">Bật</span>
                          </>
                        ) : (
                          <>
                            <BellOff className="notif-icon" />
                            <span className="notif-text">Tắt</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      {getStatusBadge(parent.status)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => setSelectedParent(parent)}
                          className="action-btn view"
                          title="Xem chi tiết"
                        >
                          <Eye className="action-icon" />
                        </button>
                        <button 
                          onClick={() => openMessageModal(parent)}
                          className="action-btn message" 
                          title="Gửi tin nhắn"
                        >
                          <MessageSquare className="action-icon" />
                        </button>
                        <button 
                          onClick={() => openEditModal(parent)}
                          className="action-btn edit" 
                          title="Chỉnh sửa"
                        >
                          <Edit className="action-icon" />
                        </button>
                        <button 
                          onClick={() => {
                            setParentToDelete(parent);
                            setShowDeleteConfirm(true);
                          }}
                          className="action-btn delete" 
                          title="Xóa"
                        >
                          <Trash2 className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="no-data">
                    Không tìm thấy phụ huynh nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredParents.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredParents.length)} trong tổng số {filteredParents.length} phụ huynh
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-nav"
              >
                <ChevronLeft className="page-icon" />
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-nav"
              >
                <ChevronRight className="page-icon" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Parent Detail Modal */}
      {selectedParent && !showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content detail-modal">
            <div className="modal-header">
              <div className="header-info">
                <div className="detail-avatar">
                  {selectedParent.avatar}
                </div>
                <div>
                  <h2 className="detail-title">{selectedParent.name}</h2>
                  <p className="detail-subtitle">Đăng ký: {selectedParent.registeredDate}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedParent(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="info-section">
                <h3 className="section-title">Thông tin liên hệ</h3>
                <div className="info-grid">
                  <div>
                    <p className="info-label">Số điện thoại</p>
                    <p className="info-value">{selectedParent.phone}</p>
                  </div>
                  <div>
                    <p className="info-label">Email</p>
                    <p className="info-value">{selectedParent.email}</p>
                  </div>
                  <div className="full-width">
                    <p className="info-label">Địa chỉ</p>
                    <p className="info-value">{selectedParent.address}</p>
                  </div>
                  <div>
                    <p className="info-label">Thông báo</p>
                    <div className="notif-status">
                      {selectedParent.notification ? (
                        <>
                          <Bell className="notif-icon-detail active" />
                          <span className="notif-text-detail">Đã bật</span>
                        </>
                      ) : (
                        <>
                          <BellOff className="notif-icon-detail" />
                          <span className="notif-text-detail">Đã tắt</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="info-label">Trạng thái</p>
                    {getStatusBadge(selectedParent.status)}
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3 className="section-title">Danh sách học sinh ({selectedParent.students.length})</h3>
                <div className="students-detail">
                  {selectedParent.students.map((student) => (
                    <div key={student.id} className="student-card">
                      <div className="student-card-content">
                        <div>
                          <p className="student-card-name">{student.name}</p>
                          <p className="student-card-info">{student.grade}</p>
                        </div>
                        <div className="student-card-bus">
                          <p className="bus-label">Xe buýt</p>
                          <p className="bus-value">{student.bus}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  onClick={() => openMessageModal(selectedParent)}
                  className="modal-btn message"
                >
                  <MessageSquare className="modal-btn-icon" />
                  Gửi tin nhắn
                </button>
                <button 
                  onClick={() => handleToggleNotification(selectedParent.id)}
                  className="modal-btn notification"
                >
                  <Bell className="modal-btn-icon" />
                  Cài đặt thông báo
                </button>
                <button 
                  onClick={() => openEditModal(selectedParent)}
                  className="modal-btn edit"
                >
                  <Edit className="modal-btn-icon" />
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-content form-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {showAddModal ? 'Thêm phụ huynh mới' : 'Chỉnh sửa thông tin'}
              </h2>
              <button 
                onClick={() => {
                  showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                  setFormData({ name: "", phone: "", email: "", address: "", notification: true });
                  setSelectedParent(null);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Họ và tên *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  placeholder="Nhập họ và tên"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Số điện thoại *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="form-input"
                  placeholder="Nhập email"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Địa chỉ *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="form-textarea"
                  placeholder="Nhập địa chỉ"
                  rows={3}
                />
              </div>
              
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.notification}
                  onChange={(e) => setFormData({...formData, notification: e.target.checked})}
                  id="notification"
                />
                <label htmlFor="notification">Bật thông báo</label>
              </div>

              <div className="modal-actions">
                <button 
                  onClick={() => {
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                    setFormData({ name: "", phone: "", email: "", address: "", notification: true });
                    setSelectedParent(null);
                  }}
                  className="modal-btn cancel"
                >
                  Hủy
                </button>
                <button 
                  onClick={showAddModal ? handleAddParent : handleEditParent}
                  className="modal-btn submit"
                >
                  {showAddModal ? 'Thêm' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && parentToDelete && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="modal-header">
              <h2 className="modal-title">Xác nhận xóa</h2>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setParentToDelete(null);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p className="confirm-text">
                Bạn có chắc chắn muốn xóa phụ huynh <strong>{parentToDelete.name}</strong>?
              </p>
              <p className="confirm-warning">
                Hành động này không thể hoàn tác!
              </p>

              <div className="modal-actions">
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setParentToDelete(null);
                  }}
                  className="modal-btn cancel"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleDeleteParent}
                  className="modal-btn delete"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && messageParent && (
        <div className="modal-overlay">
          <div className="modal-content form-modal">
            <div className="modal-header">
              <h2 className="modal-title">Gửi tin nhắn đến {messageParent.name}</h2>
              <button 
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageContent("");
                  setMessageParent(null);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nội dung tin nhắn</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="form-textarea"
                  placeholder="Nhập nội dung tin nhắn..."
                  rows={6}
                />
              </div>

              <div className="modal-actions">
                <button 
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageContent("");
                    setMessageParent(null);
                  }}
                  className="modal-btn cancel"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSendMessage}
                  className="modal-btn submit"
                >
                  <MessageSquare className="modal-btn-icon" />
                  Gửi tin nhắn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}