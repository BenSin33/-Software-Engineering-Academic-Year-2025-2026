"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, UserCircle, Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Filter, Key, User, XCircle, UserCheck,Mail } from "lucide-react";

// --- Cấu hình API Backend ---
const API_BASE_URL = "http://localhost:5000"; // Đảm bảo URL này khớp với backend của bạn

// --- Data Models cho User ---

// Interface cho một Người dùng từ API (backend trả về UserID, UserName, RoleID)
interface UserData {
    UserID: string;
    RoleID: 'R001' | 'R002' | 'R003'; // Giả định: 1=admin, 2=driver, 3=parent (dựa trên API backend)
    UserName: string;
    Password:string;
    // PasswordHash không được trả về từ GET, nhưng cần cho state
}

// Interface cho form data (Thêm/Sửa)
interface UserFormData {
    username: string;
    roleID: 'R001' | 'R002' | 'R003'; // Gửi lên dưới dạng string số
    password: string; // Mật khẩu không mã hóa khi nhập
    confirmPassword: string;
}

// Interface cho bộ lọc nâng cao
interface AdvancedFilters {
    userID: string;
    roleID: 'all' | 'R001' | 'R002' | 'R003';
}

// Chuyển RoleID từ số sang chuỗi Role (để hiển thị)
const roleMap: Record<string, string> = {
    'R001': 'ADMIN',
    'R002': 'DRIVER',
    'R003': 'PARENT',
    'admin': 'ADMIN',
    'driver': 'DRIVER',
    'parent': 'PARENT',
};

// --- Màu sắc tùy chỉnh (Orange-Yellow: #FFAC50, Dark Hover: #E59B48) ---
const PRIMARY_COLOR = "#FFAC50";
const PRIMARY_HOVER = "#E59B48";
const PRIMARY_RING = "rgba(255, 172, 80, 0.3)";

// Component phụ cho chi tiết (Modal)
const DetailItem = ({ label, value, icon: Icon }: { label: string, value: string | null, icon: React.ElementType }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <Icon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
            <p className="text-gray-500 font-medium text-xs uppercase mb-0.5">{label}</p>
            <p className="font-semibold text-gray-900 text-sm break-words">{value || "Chưa có"}</p>
        </div>
    </div>
);

// Component Modal dùng chung
const Modal = ({ show, onClose, title, children }: { show: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
    if (!show) return null;
    return (
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button suppressHydrationWarning={true} onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};


// Component chính
export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<UserData[]>([]); 
    const [currentPage, setCurrentPage] = useState(1);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    
    // roleID được sử dụng làm bộ lọc chính
    const [filterRoleID, setFilterRoleID] = useState<AdvancedFilters['roleID']>('all');    
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
        userID: "",
        roleID: 'all', 
    });

    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [showModal, setShowModal] = useState(false); // Dùng chung cho Add/Edit
    const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<UserFormData>({
        username: "",
        roleID: 'R003', // Mặc định là parent
        password: '',
        confirmPassword: '',
    });

    const itemsPerPage = 6;

    // --- API Call: Lấy toàn bộ Users ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/accounts`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Lỗi khi lấy dữ liệu người dùng.");
            }
            const data: UserData[] = await response.json();
            console.log('user: ',data)
            setUsers(data);
        } catch (err: any) {
            console.error("Lỗi Fetch Users:", err);
            setError(err.message || "Không thể tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);


    // --- Filter logic ---
    const filteredUsers = users.filter(user => {
        const searchTermLower = searchTerm.toLowerCase();
        
        // Chuyển RoleID number sang string để so sánh
        const userRoleIDStr = String(user.RoleID);

        // Tìm kiếm chung theo username hoặc userID
        const matchesSearch = String(user.UserName).toLowerCase().includes(searchTermLower) ||
            String(user.UserID).toLowerCase().includes(searchTermLower);

        // Lọc nâng cao theo userID (từ form advancedFilters)
        const matchesUserIdFilter = advancedFilters.userID === "" ||
            String(user.UserID).toLowerCase().includes(advancedFilters.userID.toLowerCase());

        // Lọc theo RoleID (từ nút filter)
        const matchesRole = filterRoleID === 'all' || userRoleIDStr === filterRoleID;

        return matchesSearch && matchesUserIdFilter && matchesRole;
    });

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const clearAdvancedFilters = () => {
        setAdvancedFilters({
            userID: "",
            roleID: 'all', 
        });
        setSearchTerm("");
        setFilterRoleID('all');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    // --- CRUD Handlers ---
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, roleID, password, confirmPassword } = formData;

    // --- VALIDATION ---
    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
        alert("Username phải từ 3-20 ký tự và chỉ bao gồm chữ cái và số.");
        return;
    }

    if (!userToEdit || password.length > 0) { // Chỉ check password nếu thêm mới hoặc nhập mới khi edit
        if (password.length < 6 || password.length > 20) {
            alert("Password phải từ 6-20 ký tự.");
            return;
        }
        if (password !== confirmPassword) {
            alert("Mật khẩu và Xác nhận mật khẩu không khớp.");
            return;
        }
    }

    if (!roleID) {
        alert("Vui lòng chọn Role cho người dùng.");
        return;
    }

    // --- LOGIC THÊM/SỬA ---
    if (userToEdit) {
        // PUT request
        try {
            const updatePayload: { UserName?: string; Password?: string; RoleID?: string } = {};
            if (username !== userToEdit.UserName) updatePayload.UserName = username;
            if (password) updatePayload.Password = password;
            if (roleID !== userToEdit.RoleID) updatePayload.RoleID = roleID;

            if (Object.keys(updatePayload).length === 0) {
                alert("Không có gì để cập nhật.");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/accounts/${userToEdit.UserID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Cập nhật thất bại.");

            alert(`Cập nhật người dùng ${username} thành công!`);
            fetchUsers();
        } catch (err: any) {
            alert(`Lỗi Cập nhật: ${err.message}`);
        }
    } else {
        // POST request
        try {
            const response = await fetch(`${API_BASE_URL}/accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, roleID }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Thêm mới thất bại.");

            alert(`Thêm người dùng ${username} thành công!`);
            fetchUsers();
        } catch (err: any) {
            alert(`Lỗi Thêm mới: ${err.message}`);
        }
    }

    setShowModal(false);
    setUserToEdit(null);
};


    // API Call: Xóa User (DELETE /users/:id)
    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/accounts/${userToDelete.UserID}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Xóa thất bại.");
            }

            alert(`Đã xóa người dùng ${userToDelete.UserName} thành công!`);
            fetchUsers(); // Tải lại danh sách
        } catch (err: any) {
            alert(`Lỗi Xóa: ${err.message}`);
        }

        // Đóng modal
        setShowDeleteConfirm(false);
        setUserToDelete(null);
    };

    const openEditModal = (user: UserData) => {
        setUserToEdit(user);
        setFormData({
            username: user.UserName,
            roleID: user.RoleID as 'R001' | 'R002' | 'R003',
            password: user.Password, // Luôn để trống khi chỉnh sửa
            confirmPassword: '',
        });
        setShowModal(true);
    };

    // Hàm để lấy chi tiết user (GET /users/:id) và hiển thị modal
    const viewUserDetails = async (userID: string) => {
        console.log('userID: ',userID)
        const user = users.find((user) => user.UserID === userID);
        console.log('user: ',user)
        if(user) setSelectedUser(user)
        // setLoading(true);
        // try {
        //     const response = await fetch(`${API_BASE_URL}/users/${userID}`);
        //     if (!response.ok) {
        //         const errorData = await response.json();
        //         throw new Error(errorData.error || "Lỗi khi lấy chi tiết người dùng.");
        //     }
        //     const user: UserData = await response.json();
        //     setSelectedUser(user);
        // } catch (err: any) {
        //     alert(`Lỗi Xem chi tiết: ${err.message}`);
        // } finally {
        //     setLoading(false);
        // }
    };


    // --- Start of JSX Render ---
    return (
        <div className="p-8 bg-gray-50 w-full min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý Người dùng</h1>
                    <p className="text-gray-500 text-base">Quản lý tài khoản Admin, Driver và Phụ huynh</p>
                </div>
                <button
                suppressHydrationWarning={true}
                    onClick={() => {
                        setUserToEdit(null); // Đặt null để biết là chế độ thêm mới
                        setShowModal(true);
                        // Clear form data
                        setFormData({ username: "", roleID: 'R003', password: '', confirmPassword: '' });
                    }}
                    className="flex items-center gap-2 text-white px-6 py-3 rounded-lg border-none cursor-pointer font-medium transition duration-200 shadow-md hover:opacity-90 active:opacity-80"
                    style={{ backgroundColor: PRIMARY_COLOR, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                >
                    <Plus className="w-5 h-5" />
                    Thêm Người dùng mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                 {/* Total Users Stat */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Tổng số Người dùng</p>
                            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                        </div>
                        <div className={`p-3 rounded-lg flex items-center justify-center bg-orange-400`}>
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                {/* Admin Stat */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Admin (Role 1)</p>
                            <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.RoleID === 'R001').length}</p>
                        </div>
                        <div className={`p-3 rounded-lg flex items-center justify-center bg-red-500`}>
                            <UserCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                {/* Driver Stat */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Driver (Role 2)</p>
                            <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.RoleID === 'R002').length}</p>
                        </div>
                        <div className={`p-3 rounded-lg flex items-center justify-center bg-blue-500`}>
                            <UserCheck className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                {/* Parent Stat */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Parent (Role 3)</p>
                            <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.RoleID === 'R003').length}</p>
                        </div>
                        <div className={`p-3 rounded-lg flex items-center justify-center bg-green-500`}>
                            <User className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md lg:w-full">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1 min-w-[250px] relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            <input
                            suppressHydrationWarning={true}
                                type="text"
                                placeholder="Tìm kiếm theo username, userID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200"
                                style={{'--tw-ring-color': PRIMARY_RING} as React.CSSProperties}
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
                            <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-3">
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Mã số người dùng (UserID)</label>
                                    <input
                                    suppressHydrationWarning={true}
                                        type="text"
                                        placeholder="VD: U001"
                                        value={advancedFilters.userID}
                                        onChange={(e) =>
                                            setAdvancedFilters({
                                                ...advancedFilters,
                                                userID: e.target.value,
                                            })
                                        }
                                        className="p-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                    />
                                </div>
                            </div>
                            <button suppressHydrationWarning={true} onClick={clearAdvancedFilters} className="px-5 py-2.5 rounded-lg border-none font-medium cursor-pointer transition duration-200 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                                Xóa bộ lọc và tìm kiếm
                            </button>
                        </div>
                    )}

                    {/* Filter theo RoleID */}
                    <div className="flex gap-2 flex-wrap mt-4">
                        <button
                        suppressHydrationWarning={true}
                            onClick={() => setFilterRoleID('all')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterRoleID === 'all' ? 'text-white bg-orange-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            style={filterRoleID === 'all' ? { backgroundColor: PRIMARY_COLOR } : {}}
                        >
                            Tất cả
                        </button>
                        {(['R001', 'R002', 'R003'] as const).map(roleId => (
                            <button
                            suppressHydrationWarning={true}
                                key={roleId}
                                onClick={() => setFilterRoleID(roleId)}
                                className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterRoleID === roleId ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                style={filterRoleID === roleId ? { 
                                    backgroundColor: roleId === 'R001' ? '#dc3545' : roleId === 'R002' ? '#007bff' : '#28a745'
                                } : {}}
                            >
                                {roleMap[roleId]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {loading ? (
                    <div className="text-center p-12 text-lg text-gray-500">Đang tải dữ liệu...</div>
                ) : error ? (
                    <div className="text-center p-12 text-lg text-red-600">Lỗi: {error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role ID</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length > 0 ? (
                                    currentUsers.map((user) => (
                                        <tr key={user.UserID} className="border-b border-gray-100 transition duration-200 hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base bg-gray-400">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <p className="font-medium text-sm text-gray-900">{user.UserName}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">{user.UserID}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span 
                                                    className={`px-3 py-1 text-xs font-semibold rounded-full`}
                                                    style={{
                                                        backgroundColor: user.RoleID === 'R001' ? '#fecaca' : user.RoleID === 'R002' ? '#bfdbfe' : '#d1fae5',
                                                        color: user.RoleID === 'R001' ? '#dc2626' : user.RoleID === 'R002' ? '#1d4ed8' : '#059669',
                                                    }}
                                                >
                                                    {roleMap[String(user.RoleID)] || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button suppressHydrationWarning={true} onClick={() => viewUserDetails(user.UserID)} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-orange-50 text-orange-500" title="Xem chi tiết" style={{ color: PRIMARY_COLOR, '--tw-bg-opacity': 0.1 } as React.CSSProperties}><Eye className="w-4 h-4" /></button>
                                                    <button suppressHydrationWarning={true} onClick={() => openEditModal(user)} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-green-100 text-green-600" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
                                                    <button suppressHydrationWarning={true} onClick={() => { setUserToDelete(user); setShowDeleteConfirm(true); }} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-red-100 text-red-600" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center p-12 text-gray-500">Không tìm thấy người dùng nào phù hợp với điều kiện tìm kiếm.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <div className="flex justify-between items-center p-6 bg-white border-t border-gray-200 flex-wrap gap-4">
                        <div className="text-gray-500 text-sm">
                            Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} trong tổng số {filteredUsers.length} người dùng
                        </div>
                        <div className="flex gap-2 items-center">
                            <button suppressHydrationWarning={true} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2.5 border border-gray-300 bg-white rounded-md cursor-pointer transition duration-200 text-sm min-w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-orange-500"><ChevronLeft className="w-4 h-4" /></button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                suppressHydrationWarning={true}
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-3 py-2 border rounded-md cursor-pointer transition duration-200 text-sm font-medium min-w-10 ${currentPage === index + 1 ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-orange-500'}`}
                                    style={currentPage === index + 1 ? { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR } : {}}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button suppressHydrationWarning={true} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2.5 border border-gray-300 bg-white rounded-md cursor-pointer transition duration-200 text-sm min-w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-orange-500"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Thêm/Sửa Người dùng */}
            <Modal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setUserToEdit(null);
                }}
                title={userToEdit ? `Chỉnh sửa Người dùng: ${userToEdit.UserName}` : 'Thêm Người dùng Mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {userToEdit && (
                             // Chỉ hiển thị UserID, không hiển thị PasswordHash vì không có trong GET /users/:id
                           <div className="flex gap-4">
                               <DetailItem label="Mã User" value={userToEdit.UserID} icon={UserCircle} />
                               {/* <DetailItem label="Password Hash" value={'******'} icon={Key} /> */}
                           </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="username" className="text-sm font-medium text-gray-700 mb-1">Username *</label>
                            <input
                            suppressHydrationWarning={true}
                                pattern="^[a-zA-Z0-9]+$" 
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="roleID" className="text-sm font-medium text-gray-700 mb-1">Role ID *</label>
                            <select
                                id="roleID"
                                name="roleID"
                                value={formData.roleID}
                                onChange={handleInputChange}
                                required
                                className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                            >
                                <option value="R003">parent R003</option>
                                <option value="R002">driver R002</option>
                                <option value="R001">admin R001</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">
                                Password {userToEdit ? '(Để trống nếu không đổi)' : '*'}
                            </label>
                            <input
                            suppressHydrationWarning={true}
                                type="text"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required={!userToEdit} // Bắt buộc khi thêm mới
                                className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1">
                                Xác nhận Password {userToEdit ? '' : '*'}
                            </label>
                            <input
                            suppressHydrationWarning={true}
                                type="text"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required={!userToEdit || (userToEdit && formData.password.length > 0)} // Bắt buộc khi thêm mới hoặc khi đã nhập password mới
                                className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                        suppressHydrationWarning={true}
                            type="button"
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                            onClick={() => { setShowModal(false); setUserToEdit(null); }}
                        >
                            Hủy
                        </button>
                        <button
                        suppressHydrationWarning={true}
                            type="submit"
                            className="px-4 py-2 text-white rounded-lg transition"
                            style={{ backgroundColor: PRIMARY_COLOR, hover: { backgroundColor: PRIMARY_HOVER } }}
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : userToEdit ? 'Cập nhật' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* User Detail Modal */}
            <Modal
                show={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title={`Chi tiết Người dùng: ${selectedUser?.UserName || ''}`}
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 border-b pb-4 mb-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl flex-shrink-0" >
                                <UserCircle className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{selectedUser.UserName}</h2>
                                <p className="text-gray-500 text-sm">Role: **{roleMap[String(selectedUser.RoleID)] || 'N/A'}**</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Mã User" value={selectedUser.UserID} icon={UserCircle} />
                            <DetailItem label="Role ID" value={String(selectedUser.RoleID)} icon={UserCheck} />
                            <DetailItem label="Tên Đăng Nhập" value={selectedUser.UserName} icon={Mail} />
                            <DetailItem label="Mật khẩu" value={selectedUser.Password} icon={Key} />
                        </div>
                    </div>
                )}
            </Modal>
            
            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Xác nhận Xóa"
            >
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Bạn có chắc chắn muốn xóa người dùng **{userToDelete?.UserName}** (ID: {userToDelete?.UserID}) không? Thao tác này không thể hoàn tác.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                        suppressHydrationWarning={true}
                            type="button"
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                            onClick={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
                        >
                            Hủy
                        </button>
                        <button
                        suppressHydrationWarning={true}
                            type="button"
                            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                            onClick={handleDeleteUser}
                            disabled={loading}
                        >
                            {loading ? 'Đang xóa...' : 'Xóa'}
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
}

// END OF COMPONENT