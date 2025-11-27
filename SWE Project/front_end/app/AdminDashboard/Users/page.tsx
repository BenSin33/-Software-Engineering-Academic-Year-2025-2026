"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, UserCircle, Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Filter, Key, User, XCircle, UserCheck, Mail, AlertCircle } from "lucide-react";

// --- Cấu hình API Backend ---
const API_BASE_URL = "http://localhost:5000";

// --- Data Models ---
interface UserData {
    UserID: string;
    RoleID: 'R001' | 'R002' | 'R003';
    UserName: string;
    Password: string;
}

interface UserFormData {
    username: string;
    roleId: string;
    password: string;
    confirmPassword: string;
}

interface AdvancedFilters {
    userID: string;
    roleID: 'all' | 'R001' | 'R002' | 'R003';
}

// Validation errors interface
interface ValidationErrors {
    username?: string;
    password?: string;
    confirmPassword?: string;
    roleId?: string;
}

const roleMap: Record<string, string> = {
    'R001': 'ADMIN',
    'R002': 'DRIVER',
    'R003': 'PARENT',
};

const PRIMARY_COLOR = "#FFAC50";
const PRIMARY_HOVER = "#E59B48";
const PRIMARY_RING = "rgba(255, 172, 80, 0.3)";

// Error Display Component
const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
        <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{message}</span>
        </div>
    );
};

const DetailItem = ({ label, value, icon: Icon }: { label: string, value: string | null, icon: React.ElementType }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <Icon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
            <p className="text-gray-500 font-medium text-xs uppercase mb-0.5">{label}</p>
            <p className="font-semibold text-gray-900 text-sm break-words">{value || "Chưa có"}</p>
        </div>
    </div>
);

const Modal = ({ show, onClose, title, children }: { show: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
    if (!show) return null;
    return (
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
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
const UserForm = ({ 
    isEdit, 
    formData, 
    validationErrors, 
    touched, 
    handleInputChange, 
    handleBlur, 
    handleSubmit, 
    setShowModal, 
    setUserToEdit, 
    resetForm,
    loading 
}: { 
    isEdit: boolean;
    formData: UserFormData;
    validationErrors: ValidationErrors;
    touched: Record<string, boolean>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleBlur: (fieldName: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    setShowModal: (show: boolean) => void;
    setUserToEdit: (user: UserData | null) => void;
    resetForm: () => void;
    loading: boolean;
}) => {
    const roleMap: Record<string, string> = {
        'R001': 'ADMIN',
        'R002': 'DRIVER',
        'R003': 'PARENT',
    };
    
    const PRIMARY_COLOR = "#FFAC50";

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
                {/* Username */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Tên đăng nhập *
                    </label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('username')}
                        className={`w-full p-2.5 border rounded-lg text-sm transition-all duration-200 focus:outline-none ${
                            validationErrors.username && touched.username 
                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                        }`}
                        placeholder="Nhập tên đăng nhập (VD: john_doe)"
                        disabled={isEdit}
                    />
                    {touched.username && <ErrorMessage message={validationErrors.username} />}
                    <p className="text-xs text-gray-500 mt-1">Tối thiểu 3 ký tự, chỉ chữ, số và gạch dưới</p>
                </div>

                {/* Role ID */}
                <div>
                    <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                        Vai trò *
                    </label>
                    <select
                        id="roleId"
                        name="roleId"
                        value={formData.roleId}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('roleId')}
                        className={`w-full p-2.5 border rounded-lg text-sm transition-all duration-200 focus:outline-none ${
                            validationErrors.roleId && touched.roleId 
                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                        } bg-white`}
                    >
                        <option value="">-- Chọn vai trò --</option>
                        <option value="R001">ADMIN ({roleMap['R001']})</option>
                        <option value="R002">DRIVER ({roleMap['R002']})</option>
                        <option value="R003">PARENT ({roleMap['R003']})</option>
                    </select>
                    {touched.roleId && <ErrorMessage message={validationErrors.roleId} />}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu {isEdit && <span className="text-gray-500 font-normal italic">(Để trống nếu không muốn thay đổi)</span>}
                        {!isEdit && <span className="text-red-600">*</span>}
                    </label>
                    <input
                        id="password"
                        type="text"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('password')}
                        className={`w-full p-2.5 border rounded-lg text-sm transition-all duration-200 focus:outline-none ${
                            validationErrors.password && touched.password 
                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                        }`}
                        placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    />
                    {touched.password && <ErrorMessage message={validationErrors.password} />}
                    <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu {!isEdit && <span className="text-red-600">*</span>}
                    </label>
                    <input
                        id="confirmPassword"
                        type="text"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={`w-full p-2.5 border rounded-lg text-sm transition-all duration-200 focus:outline-none ${
                            validationErrors.confirmPassword && touched.confirmPassword 
                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                        }`}
                        placeholder="Nhập lại mật khẩu"
                    />
                    {touched.confirmPassword && <ErrorMessage message={validationErrors.confirmPassword} />}
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => { setShowModal(false); setUserToEdit(null); resetForm(); }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-white rounded-lg font-medium transition duration-200 shadow-md hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                >
                    {loading ? 'Đang xử lý...' : (isEdit ? "Cập nhật" : "Thêm mới")}
                </button>
            </div>
        </form>
    );
};
export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<UserData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [filterRoleID, setFilterRoleID] = useState<AdvancedFilters['roleID']>('all');
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
        userID: "",
        roleID: 'all',
    });

    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<UserFormData>({
        username: "",
        roleId: '',
        password: '',
        confirmPassword: '',
    });

    // State cho validation errors
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const itemsPerPage = 6;

    // Validation functions theo backend rules
    const validateUsername = (username: string): string | undefined => {
        const trimmed = username.trim();
        
        if (!trimmed) {
            return 'Tên đăng nhập không được để trống';
        }
        
        if (trimmed.length < 3) {
            return 'Tên đăng nhập phải từ 3 ký tự';
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            return 'Chỉ dùng chữ, số và gạch dưới';
        }
        
        return undefined;
    };

    const validatePassword = (password: string, isEdit: boolean): string | undefined => {
        // Nếu đang edit và password rỗng thì bỏ qua validation
        if (isEdit && !password) {
            return undefined;
        }
        
        if (!password) {
            return 'Mật khẩu không được để trống';
        }
        
        if (password.length < 6) {
            return 'Mật khẩu phải từ 6 ký tự';
        }
        
        return undefined;
    };

    const validateConfirmPassword = (password: string, confirmPassword: string, isEdit: boolean): string | undefined => {
        // Nếu đang edit và cả 2 đều rỗng thì bỏ qua
        if (isEdit && !password && !confirmPassword) {
            return undefined;
        }
        
        if (password && !confirmPassword) {
            return 'Vui lòng xác nhận mật khẩu';
        }
        
        if (password !== confirmPassword) {
            return 'Mật khẩu xác nhận không khớp';
        }
        
        return undefined;
    };

    const validateRoleId = (roleId: string): string | undefined => {
        if (!roleId) {
            return 'Vui lòng chọn vai trò';
        }
        
        if (!['R001', 'R002', 'R003'].includes(roleId)) {
            return 'RoleID phải là R001, R002 hoặc R003';
        }
        
        return undefined;
    };

    // Validate toàn bộ form
    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};
        const isEdit = !!userToEdit;
        
        errors.username = validateUsername(formData.username);
        errors.password = validatePassword(formData.password, isEdit);
        errors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword, isEdit);
        errors.roleId = validateRoleId(formData.roleId);
        
        setValidationErrors(errors);
        
        // Trả về true nếu không có lỗi
        return !Object.values(errors).some(error => error !== undefined);
    };

    // Validate realtime khi người dùng nhập
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Mark field as touched
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // Validate field ngay lập tức
        const isEdit = !!userToEdit;
        let fieldError: string | undefined;
        
        switch (name) {
            case 'username':
                fieldError = validateUsername(value);
                break;
            case 'password':
                fieldError = validatePassword(value, isEdit);
                // Revalidate confirmPassword nếu đã được touch
                if (touched.confirmPassword) {
                    setValidationErrors(prev => ({
                        ...prev,
                        confirmPassword: validateConfirmPassword(value, formData.confirmPassword, isEdit)
                    }));
                }
                break;
            case 'confirmPassword':
                fieldError = validateConfirmPassword(formData.password, value, isEdit);
                break;
            case 'roleId':
                fieldError = validateRoleId(value);
                break;
        }
        
        setValidationErrors(prev => ({ ...prev, [name]: fieldError }));
    };

    const handleBlur = (fieldName: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/accounts`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Lỗi khi lấy dữ liệu người dùng.");
            }
            const res = await response.json();
            const data: UserData[] = res.data;
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

    const filteredUsers = users.filter(user => {
        const searchTermLower = searchTerm.toLowerCase();
        const userRoleIDStr = String(user.RoleID);
        const matchesSearch = String(user.UserName).toLowerCase().includes(searchTermLower) ||
            String(user.UserID).toLowerCase().includes(searchTermLower);
        const matchesUserIdFilter = advancedFilters.userID === "" ||
            String(user.UserID).toLowerCase().includes(advancedFilters.userID.toLowerCase());
        const matchesRole = filterRoleID === 'all' || userRoleIDStr === filterRoleID;
        return matchesSearch && matchesUserIdFilter && matchesRole;
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        console.log('handle submit: ',Date.now())
        e.preventDefault();
        
        // Validate form trước khi submit
        if (!validateForm()) {
            alert("Vui lòng kiểm tra lại thông tin nhập vào");
            return;
        }

        const { username, roleId, password } = formData;

        if (userToEdit) {
            console.log('kevav')
            console.log('userToEdit: ',userToEdit)
            try {
                const updatePayload: { UserName?: string; Password?: string; RoleID?: string } = {};
                 updatePayload.UserName = username;
                 updatePayload.Password = password;
                 updatePayload.RoleID = roleId;

                if (Object.keys(updatePayload).length === 0) {
                    alert("Không có gì để cập nhật.");
                    setShowModal(false);
                    setUserToEdit(null);
                    resetForm();
                    return;
                }
                console.log('updatePayload: ',updatePayload)
                const response = await fetch(`${API_BASE_URL}/accounts/${userToEdit.UserID}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload),
                });

                const result = await response.json();
                console.log('update result: ',result)
                if (!response.ok) throw new Error(result.error || "Cập nhật thất bại.");

                alert(`Cập nhật người dùng ${username} thành công!`);
                fetchUsers();
            } catch (err: any) {
                alert(`Lỗi Cập nhật: ${err.message}`);
            }
        } else {
            console.log('add kevav')
            
            try {
                const response = await fetch(`${API_BASE_URL}/accounts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, roleId }),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "Thêm mới thất bại.");

                alert(`Thêm người dùng ${username} thành công!`);
                fetchUsers();
            } catch (err: any) {
                alert(`Lỗi Thêm mới: ${err.message}`);
            }
        }

        // setShowModal(false);
        // setUserToEdit(null);
        // resetForm();
    };

    const resetForm = () => {
        setFormData({ username: "", roleId: '', password: '', confirmPassword: '' });
        setValidationErrors({});
        setTouched({});
    };

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
            fetchUsers();
        } catch (err: any) {
            alert(`Lỗi Xóa: ${err.message}`);
        }

        setShowDeleteConfirm(false);
        setUserToDelete(null);
    };

    const openEditModal = (user: UserData) => {
        setUserToEdit(user);
        setFormData({
            username: user.UserName,
            roleId: user.RoleID,
            password: user.Password,
            confirmPassword: user.Password,
        });
        setValidationErrors({}); // Clear errors on opening modal
        setTouched({}); // Clear touched on opening modal
        setShowModal(true);
    };

    const openAddModal = () => {
        setUserToEdit(null);
        resetForm();
        setShowModal(true);
    };

    const viewUserDetails = (userID: string) => {
        const user = users.find((user) => user.UserID === userID);
        if (user) setSelectedUser(user);
    };

    // Form component (Extract to separate component in a real app)
    // const UserForm = ({ isEdit }: { isEdit: boolean }) => (
    //     <form onSubmit={handleSubmit}>
    //         <div className="grid grid-cols-1 gap-4">
    //             {/* Username */}
    //             <div>
    //                 <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
    //                 <input
    //                     id="username"
    //                     type="text"
    //                     name="username"
    //                     value={formData.username}
    //                     onChange={handleInputChange}
    //                     onBlur={() => handleBlur('username')}
    //                     className={`w-full p-2.5 border rounded-lg text-sm transition-all duration-200 focus:outline-none ${validationErrors.username && touched.username ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'}`}
    //                     placeholder="Nhập tên đăng nhập"
    //                     disabled={isEdit} // Thường không cho phép chỉnh sửa username
    //                 />
    //                 {touched.username && <ErrorMessage message={validationErrors.username} />}
    //             </div>

    //             {/* Role ID */}
    //             <div>
    //                 <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
    //                 <select
    //                     id="roleId"
    //                     name="roleId"
    //                     value={formData.roleId}
    //                     onChange={handleInputChange}
    //                     onBlur={() => handleBlur('roleId')}
    //                     className={`w-full p-2.5 border rounded-lg text-sm transition-all duration-200 focus:outline-none ${validationErrors.roleId && touched.roleId ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'} bg-white`}
    //                 >
    //                     <option value="">Chọn vai trò...</option>
    //                     <option value="R001">ADMIN ({roleMap['R001']})</option>
    //                     <option value="R002">DRIVER ({roleMap['R002']})</option>
    //                     <option value="R003">PARENT ({roleMap['R003']})</option>
    //                 </select>
    //                 {touched.roleId && <ErrorMessage message={validationErrors.roleId} />}
    //             </div>

    //             {/* Password */}
    //             <div>
    //                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
    //                     Mật khẩu {isEdit && <span className="text-gray-500 font-normal italic">(Để trống nếu không muốn thay đổi)</span>}
    //                 </label>
    //                 <input
    //                     id="password"
    //                     type="password"
    //                     name="password"
    //                     value={formData.password}
    //                     onChange={handleInputChange}
    //                     onBlur={() => handleBlur('password')}
    //                     className={`w-full p-2.5 border rounded-lg text-sm transition-all duration-200 focus:outline-none ${validationErrors.password && touched.password ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'}`}
    //                     placeholder={isEdit ? "**********" : "Nhập mật khẩu"}
    //                 />
    //                 {touched.password && <ErrorMessage message={validationErrors.password} />}
    //             </div>

    //             {/* Confirm Password */}
    //             <div>
    //                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
    //                 <input
    //                     id="confirmPassword"
    //                     type="password"
    //                     name="confirmPassword"
    //                     value={formData.confirmPassword}
    //                     onChange={handleInputChange}
    //                     onBlur={() => handleBlur('confirmPassword')}
    //                     className={`w-full p-2.5 border rounded-lg text-sm transition-all duration-200 focus:outline-none ${validationErrors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'}`}
    //                     placeholder={isEdit ? "**********" : "Xác nhận mật khẩu"}
    //                 />
    //                 {touched.confirmPassword && <ErrorMessage message={validationErrors.confirmPassword} />}
    //             </div>
    //         </div>

    //         <div className="mt-6 flex justify-end gap-3">
    //             <button
    //                 type="button"
    //                 onClick={() => { setShowModal(false); setUserToEdit(null); resetForm(); }}
    //                 className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition"
    //             >
    //                 Hủy
    //             </button>
    //             <button
    //                 type="submit"
    //                 className="px-4 py-2 text-white rounded-lg font-medium transition duration-200 shadow-md hover:opacity-90"
    //                 style={{ backgroundColor: PRIMARY_COLOR }}
    //             >
    //                 {isEdit ? "Cập nhật" : "Tạo mới"}
    //             </button>
    //         </div>
    //     </form>
    // );

    return (
        <div className="p-8 bg-gray-50 w-full min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý Người dùng</h1>
                    <p className="text-gray-500 text-base">Quản lý tài khoản Admin, Driver và Phụ huynh</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 text-white px-6 py-3 rounded-lg border-none cursor-pointer font-medium transition duration-200 shadow-md hover:opacity-90 active:opacity-80"
                    style={{ backgroundColor: PRIMARY_COLOR, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                >
                    <Plus className="w-5 h-5" />
                    Thêm Người dùng mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Tổng số Người dùng</p>
                            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                        </div>
                        <div className="p-3 rounded-lg flex items-center justify-center bg-orange-400">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Admin (Role 1)</p>
                            <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.RoleID === 'R001').length}</p>
                        </div>
                        <div className="p-3 rounded-lg flex items-center justify-center bg-red-500">
                            <UserCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Driver (Role 2)</p>
                            <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.RoleID === 'R002').length}</p>
                        </div>
                        <div className="p-3 rounded-lg flex items-center justify-center bg-blue-500">
                            <UserCheck className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Parent (Role 3)</p>
                            <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.RoleID === 'R003').length}</p>
                        </div>
                        <div className="p-3 rounded-lg flex items-center justify-center bg-green-500">
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
                                type="text"
                                placeholder="Tìm kiếm theo username, userID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200"
                            />
                        </div>
                        <button
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
                            <button onClick={clearAdvancedFilters} className="px-5 py-2.5 rounded-lg border-none font-medium cursor-pointer transition duration-200 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                                Xóa bộ lọc và tìm kiếm
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2 flex-wrap mt-4">
                        <button
                            onClick={() => setFilterRoleID('all')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterRoleID === 'all' ? 'text-white bg-orange-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            style={filterRoleID === 'all' ? { backgroundColor: PRIMARY_COLOR } : {}}
                        >
                            Tất cả
                        </button>
                        {(['R001', 'R002', 'R003'] as const).map(roleId => (
                            <button
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
                                                    className="px-3 py-1 text-xs font-semibold rounded-full"
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
                                                    <button onClick={() => viewUserDetails(user.UserID)} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-orange-50 text-orange-500" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                                                    <button onClick={() => openEditModal(user)} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-green-100 text-green-600" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => { setUserToDelete(user); setShowDeleteConfirm(true); }} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-red-100 text-red-600" title="Xóa"><Trash2 className="w-4 h-4" /></button>
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
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2.5 border border-gray-300 bg-white rounded-md cursor-pointer transition duration-200 text-sm min-w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-orange-500"><ChevronLeft className="w-4 h-4" /></button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-4 py-2 rounded-md font-medium transition duration-200 text-sm ${currentPage === index + 1 ? 'text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                                    style={currentPage === index + 1 ? { backgroundColor: PRIMARY_COLOR } : {}}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2.5 border border-gray-300 bg-white rounded-md cursor-pointer transition duration-200 text-sm min-w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-orange-500"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Add/Edit User */}
           <Modal
                show={showModal}
                onClose={() => { setShowModal(false); setUserToEdit(null); resetForm(); }}
                title={userToEdit ? "Chỉnh sửa Người dùng" : "Thêm Người dùng mới"}
            >
                <UserForm 
                    isEdit={!!userToEdit}
                    formData={formData}
                    validationErrors={validationErrors}
                    touched={touched}
                    handleInputChange={handleInputChange}
                    handleBlur={handleBlur}
                    handleSubmit={handleSubmit}
                    setShowModal={setShowModal}
                    setUserToEdit={setUserToEdit}
                    resetForm={resetForm}
                    loading={loading}
                />
            </Modal>

            {/* Modal User Details */}
            <Modal
                show={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title="Chi tiết Người dùng"
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 border-b pb-4 mb-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <UserCircle className="w-10 h-10 text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{selectedUser.UserName}</h2>
                                <p className="text-gray-500 text-sm">
                                    Vai trò: <strong>{roleMap[selectedUser.RoleID]}</strong>
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            <DetailItem label="Mã User" value={selectedUser.UserID} icon={UserCircle} />
                            <DetailItem label="Tên đăng nhập" value={selectedUser.UserName} icon={Mail} />
                            <DetailItem 
                                label="Vai trò" 
                                value={`${roleMap[selectedUser.RoleID]} (${selectedUser.RoleID})`} 
                                icon={UserCheck} 
                            />
                            <DetailItem 
                                label="Mật khẩu" 
                                value={selectedUser.Password} 
                                icon={Key} 
                            />
                        </div>
                    </div>
                )}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="px-4 py-2 text-white rounded-lg font-medium transition duration-200 shadow-md hover:opacity-90"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                        Đóng
                    </button>
                </div>
            </Modal>

            {/* Modal Delete Confirmation */}
            <Modal
                show={showDeleteConfirm}
                onClose={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
                title="Xác nhận Xóa"
            >
                {userToDelete && (
                    <>
                        <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa người dùng **{userToDelete.UserName}** (UserID: {userToDelete.UserID})?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg font-medium hover:bg-red-700 transition duration-200 shadow-md"
                            >
                                <Trash2 className="w-4 h-4 inline mr-1" /> Xóa
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}

// END OF COMPONENT