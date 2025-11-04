"use client";

import React, { useState, useEffect, ReactElement } from "react";
import { Users, Phone, Mail, MapPin, UserCircle, Search, Plus, Edit, Trash2, Eye, MessageSquare, Bell, BellOff, CheckCircle, XCircle, ChevronLeft, ChevronRight, Filter, Loader, AlertCircle, RefreshCw } from "lucide-react";
import MessagePanel from "@/components/Parent/MessagePanel";
import { getAllParents, deleteParent, createParent, updateParent, Parent as APIParent } from "@/app/API/parentService";
import "@/app/AdminDashboard/Parents/ParentsPage.css";

interface Student {
  id: number;
  name: string;
  grade: string;
  bus: string;
}

interface Parent {
  id: string;
  userId: string;
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
  const [showViewModal, setShowViewModal] = useState(false);
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
  
  // Message Panel States
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [messageParent, setMessageParent] = useState<Parent | null>(null);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [parents, setParents] = useState<Parent[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    notification: true
  });

  const itemsPerPage = 6;

  // 🔥 Load parents từ API khi component mount
  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Loading parents from API...');
      const apiParents = await getAllParents();
      
      console.log(' Parents loaded:', apiParents);
      
      // Convert API data sang format của component
      const formattedParents: Parent[] = apiParents.map((p: APIParent) => ({
        id: p.ParentID,
        userId: p.UserID,
        name: p.FullName,
        phone: p.PhoneNumber,
        email: p.Email,
        address: p.Address || '',
        students: [], // TODO: Lấy từ student service nếu có
        status: 'active', // Mặc định active
        notification: true, // Mặc định bật
        registeredDate: p.CreatedAt 
          ? new Date(p.CreatedAt).toLocaleDateString('vi-VN')
          : new Date().toLocaleDateString('vi-VN'),
        avatar: p.FullName.charAt(0).toUpperCase()
      }));
      
      setParents(formattedParents);
    } catch (err: any) {
      console.error(' Error loading parents:', err);
      setError(err.message || 'Không thể tải danh sách phụ huynh');
    } finally {
      setLoading(false);
    }
  };

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

  // 🔧 Mở Message Panel với userId từ database
  const openMessagePanel = (parent: Parent) => {
    setMessageParent(parent);
    setShowMessagePanel(true);
  };

  const closeMessagePanel = () => {
    setShowMessagePanel(false);
    setMessageParent(null);
  };

  const handleDeleteParent = async () => {
    if (!parentToDelete) return;

    try {
      setDeleteLoading(true);
      console.log('🗑️ Deleting parent:', parentToDelete.id);
      
      await deleteParent(parentToDelete.id);
      
      // Reload danh sách sau khi xóa
      await loadParents();
      
      setShowDeleteConfirm(false);
      setParentToDelete(null);
      alert("Xóa phụ huynh thành công!");
    } catch (err: any) {
      console.error(' Error deleting parent:', err);
      alert(`Lỗi khi xóa: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
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

  const handleAddParent = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      setSaveLoading(true);
      console.log('➕ Adding new parent:', formData);

      // 🔥 Tạo UserID tự động (lấy từ số lượng parents hiện tại + 1)
      const nextUserNumber = parents.length + 4; // Bắt đầu từ U004
      const newUserId = `U${String(nextUserNumber).padStart(3, '0')}`; // U004, U005, ...

      // 🔥 Gọi API create parent
      await createParent({
        userId: newUserId,
        fullName: formData.name,
        phoneNumber: formData.phone,
        email: formData.email,
        address: formData.address || ''
      });

      console.log(' Parent created with UserID:', newUserId);

      // Reload data từ database
      await loadParents();
      
      setShowAddModal(false);
      setFormData({ name: "", phone: "", email: "", address: "", notification: true });
      alert("Thêm phụ huynh thành công!");
    } catch (err: any) {
      console.error(' Error adding parent:', err);
      alert(`Lỗi khi thêm: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditParent = async () => {
    if (!selectedParent) return;

    if (!formData.name || !formData.phone || !formData.email) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      setSaveLoading(true);
      console.log('✏️ Updating parent:', selectedParent.id, formData);

      // 🔥 Gọi API update parent
      await updateParent(selectedParent.id, {
        fullName: formData.name,
        phoneNumber: formData.phone,
        email: formData.email,
        address: formData.address
      });

      console.log(' Parent updated successfully');

      // Reload data từ database
      await loadParents();
      
      setShowEditModal(false);
      setSelectedParent(null);
      setFormData({ name: "", phone: "", email: "", address: "", notification: true });
      alert("Cập nhật thông tin thành công!");
    } catch (err: any) {
      console.error(' Error updating parent:', err);
      alert(`Lỗi khi cập nhật: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleNotification = (parentId: string) => {
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
    { label: "Tổng phụ huynh", value: parents.length.toString(), color: "stat-purple", icon: Users },
    { label: "Đang hoạt động", value: parents.filter(p => p.status === "active").length.toString(), color: "stat-green", icon: CheckCircle },
    { label: "Nhận thông báo", value: parents.filter(p => p.notification).length.toString(), color: "stat-blue", icon: Bell },
    { label: "Mới tháng này", value: "+24", color: "stat-orange", icon: UserCircle }
  ];

  // Loading State
  if (loading) {
    return (
      <div className="parents-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Quản lý Phụ huynh</h1>
            <p className="page-subtitle">Đang tải dữ liệu...</p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite' }} color="#FFAC50" />
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Đang tải danh sách phụ huynh...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="parents-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Quản lý Phụ huynh</h1>
            <p className="page-subtitle">Có lỗi xảy ra</p>
          </div>
        </div>
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '2rem',
          borderRadius: '12px',
          margin: '2rem',
          textAlign: 'center'
        }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Không thể tải dữ liệu</h3>
          <p style={{ margin: '0 0 1rem 0' }}>{error}</p>
          <button
            onClick={loadParents}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#FFAC50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

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
                          <p className="student-count">
                            {parent.students.length} học sinh
                          </p>
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
                        {parent.students.length > 0 ? (
                          parent.students.map((student) => (
                            <div key={student.id} className="student-item">
                              <p className="student-name">{student.name}</p>
                              <p className="student-details">{student.grade} - {student.bus}</p>
                            </div>
                          ))
                        ) : (
                          <p className="student-details">Chưa có học sinh</p>
                        )}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedParent(parent);
                            setShowViewModal(true);
                          }}
                          className="action-btn view"
                          title="Xem chi tiết"
                        >
                          <Eye className="action-icon" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openMessagePanel(parent);
                          }}
                          className="action-btn message" 
                          title="Gửi tin nhắn đến phụ huynh"
                        >
                          <MessageSquare className="action-icon" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(parent);
                          }}
                          className="action-btn edit" 
                          title="Chỉnh sửa"
                        >
                          <Edit className="action-icon" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
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

      {/* 🔧 Message Panel Modal */}
      {showMessagePanel && messageParent && (
        <div className="message-modal-overlay" onClick={closeMessagePanel}>
          <div className="message-modal-content" onClick={(e) => e.stopPropagation()}>
            <MessagePanel
              parentId={1} // Admin ID = 1
              receiverId={(() => {
                // 🔧 SỬA: Extract số từ UserID
                // U004 -> 4, U005 -> 5, U010 -> 10
                const match = messageParent.userId.match(/\d+/);
                const id = match ? parseInt(match[0]) : 0;
                console.log('🔍 Parent UserID:', messageParent.userId, '-> receiverId:', id);
                return id;
              })()}
              receiverName={messageParent.name}
              onClose={closeMessagePanel}
            />
          </div>
        </div>
      )}

      {/* View Parent Detail Modal */}
      {showViewModal && selectedParent && (
        <div className="modal-overlay" onClick={() => {
          setShowViewModal(false);
          setSelectedParent(null);
        }}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-info">
                <div className="detail-avatar">
                  {selectedParent.avatar}
                </div>
                <div>
                  <h2 className="detail-title">{selectedParent.name}</h2>
                  <p className="detail-subtitle">ID: {selectedParent.id}</p>
                </div>
              </div>
              <button onClick={() => {
                setShowViewModal(false);
                setSelectedParent(null);
              }} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="info-section">
                <h3 className="section-title">Thông tin liên hệ</h3>
                <div className="info-grid">
                  <div>
                    <span className="info-label">Số điện thoại</span>
                    <p className="info-value">{selectedParent.phone}</p>
                  </div>
                  <div>
                    <span className="info-label">Email</span>
                    <p className="info-value">{selectedParent.email}</p>
                  </div>
                  <div className="full-width">
                    <span className="info-label">Địa chỉ</span>
                    <p className="info-value">{selectedParent.address || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>
              
              <div className="info-section">
                <h3 className="section-title">Thông tin khác</h3>
                <div className="info-grid">
                  <div>
                    <span className="info-label">User ID</span>
                    <p className="info-value">{selectedParent.userId}</p>
                  </div>
                  <div>
                    <span className="info-label">Ngày đăng ký</span>
                    <p className="info-value">{selectedParent.registeredDate}</p>
                  </div>
                  <div>
                    <span className="info-label">Trạng thái</span>
                    {getStatusBadge(selectedParent.status)}
                  </div>
                  <div>
                    <span className="info-label">Thông báo</span>
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
                </div>
              </div>

              {selectedParent.students.length > 0 && (
                <div className="info-section">
                  <h3 className="section-title">Học sinh ({selectedParent.students.length})</h3>
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
              )}

              {selectedParent.students.length === 0 && (
                <div className="info-section">
                  <h3 className="section-title">Học sinh</h3>
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#9ca3af',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <UserCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>Chưa có học sinh nào</p>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    openMessagePanel(selectedParent);
                  }}
                  className="modal-btn message"
                >
                  <MessageSquare className="modal-btn-icon" />
                  Gửi tin nhắn
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedParent);
                  }}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && parentToDelete && (
        <div className="modal-overlay" onClick={() => !deleteLoading && setShowDeleteConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Xác nhận xóa</h2>
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="modal-close"
                disabled={deleteLoading}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Bạn có chắc chắn muốn xóa phụ huynh <strong>{parentToDelete.name}</strong> không?
              </p>
              <p className="confirm-warning">
                ⚠️ Hành động này không thể hoàn tác!
              </p>
              <div className="modal-actions">
                <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="modal-btn cancel"
                  disabled={deleteLoading}
                >
                  <XCircle className="modal-btn-icon" />
                  Hủy
                </button>
                <button 
                  onClick={handleDeleteParent} 
                  className="modal-btn delete"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <Loader className="modal-btn-icon" style={{ animation: 'spin 1s linear infinite' }} />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="modal-btn-icon" />
                      Xóa
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Parent Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => !saveLoading && setShowAddModal(false)}>
          <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Thêm phụ huynh mới</h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="modal-close"
                disabled={saveLoading}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Họ và tên <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Nhập họ và tên"
                  disabled={saveLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại <span style={{color: 'red'}}>*</span></label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                  placeholder="VD: 0901234567"
                  disabled={saveLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span style={{color: 'red'}}>*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="VD: email@example.com"
                  disabled={saveLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="form-textarea"
                  placeholder="Nhập địa chỉ"
                  disabled={saveLoading}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="modal-btn cancel"
                  disabled={saveLoading}
                >
                  <XCircle className="modal-btn-icon" />
                  Hủy
                </button>
                <button 
                  onClick={handleAddParent} 
                  className="modal-btn submit"
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <>
                      <Loader className="modal-btn-icon" style={{ animation: 'spin 1s linear infinite' }} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Plus className="modal-btn-icon" />
                      Thêm mới
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Parent Modal */}
      {showEditModal && selectedParent && (
        <div className="modal-overlay" onClick={() => !saveLoading && setShowEditModal(false)}>
          <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Chỉnh sửa thông tin phụ huynh</h2>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="modal-close"
                disabled={saveLoading}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Họ và tên <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Nhập họ và tên"
                  disabled={saveLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại <span style={{color: 'red'}}>*</span></label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                  placeholder="VD: 0901234567"
                  disabled={saveLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span style={{color: 'red'}}>*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="VD: email@example.com"
                  disabled={saveLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="form-textarea"
                  placeholder="Nhập địa chỉ"
                  disabled={saveLoading}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="modal-btn cancel"
                  disabled={saveLoading}
                >
                  <XCircle className="modal-btn-icon" />
                  Hủy
                </button>
                <button 
                  onClick={handleEditParent} 
                  className="modal-btn submit"
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <>
                      <Loader className="modal-btn-icon" style={{ animation: 'spin 1s linear infinite' }} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Edit className="modal-btn-icon" />
                      Cập nhật
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .message-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .message-modal-content {
          background: transparent;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          height: 600px;
          max-height: 90vh;
          min-height: 500px;
          display: flex;
          flex-direction: column;
          overflow: visible;
          position: relative;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}