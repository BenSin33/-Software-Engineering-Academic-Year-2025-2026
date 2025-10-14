"use client";

import React, { useState, ReactElement } from "react";
import { Users, Phone, Mail, MapPin, UserCircle, Search, Plus, Edit, Trash2, Eye, School, ChevronLeft, ChevronRight, Filter, Route as RouteIcon, UserCheck, CheckCircle, XCircle, Home } from "lucide-react";

// --- Data Models ---

// Interface for a single student
interface Student {
    id: number;
    fullName: string;
    class: string; // e.g., '10A1', '12B5'
    studentId: string;
    email: string;
    parentName: string;
    parentPhone: string;
    registeredDate: string;
    status: 'active' | 'inactive' | 'graduated'; // e.g., 'active', 'inactive', 'graduated'
    avatar: string; // Short initials for display
}

// Interface for the form data (Add/Edit)
interface FormData {
    fullName: string;
    class: string;
    studentId: string;
    email: string;
    parentName: string;
    parentPhone: string;
}

// Interface for advanced filters
interface AdvancedFilters {
    studentId: string;
    class: string;
    parentName: string;
}

// --- Màu sắc tùy chỉnh (Orange-Yellow: #FFAC50, Dark Hover: #E59B48) ---
const PRIMARY_COLOR = "#FFAC50";
const PRIMARY_HOVER = "#E59B48";
const PRIMARY_RING = "rgba(255, 172, 80, 0.3)";

export default function StudentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
        studentId: "",
        class: "",
        parentName: ""
    });

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

    // Sample data for students
    const [students, setStudents] = useState<Student[]>([
        {
            id: 1,
            fullName: "Lê Minh Khang",
            class: "10A1",
            studentId: "HS2024001",
            email: "khanglm@school.com",
            parentName: "Lê Văn Tùng",
            parentPhone: "0901112233",
            registeredDate: "01/08/2024",
            status: "active",
            avatar: "LK"
        },
        {
            id: 2,
            fullName: "Trần Mai Phương",
            class: "12B5",
            studentId: "HS2022045",
            email: "phuongtm@school.com",
            parentName: "Trần Thị Lan",
            parentPhone: "0912223344",
            registeredDate: "15/08/2022",
            status: "active",
            avatar: "TP"
        },
        {
            id: 3,
            fullName: "Nguyễn Duy Anh",
            class: "11C3",
            studentId: "HS2023101",
            email: "anhnd@school.com",
            parentName: "Nguyễn Văn Hùng",
            parentPhone: "0923334455",
            registeredDate: "10/08/2023",
            status: "inactive",
            avatar: "NA"
        },
        {
            id: 4,
            fullName: "Phạm Khánh Ly",
            class: "12B5",
            studentId: "HS2022080",
            email: "lypk@school.com",
            parentName: "Phạm Thanh Lâm",
            parentPhone: "0934445566",
            registeredDate: "05/08/2022",
            status: "graduated",
            avatar: "PL"
        },
    ]);

    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        class: "",
        studentId: "",
        email: "",
        parentName: "",
        parentPhone: ""
    });

    const itemsPerPage = 6;

    // Filter logic for students
    const filteredStudents = students.filter(student => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = student.fullName.toLowerCase().includes(searchTermLower) ||
            student.studentId.toLowerCase().includes(searchTermLower) ||
            student.email.toLowerCase().includes(searchTermLower) ||
            student.class.toLowerCase().includes(searchTermLower);

        const matchesStudentId = advancedFilters.studentId === "" ||
            student.studentId.toLowerCase().includes(advancedFilters.studentId.toLowerCase());

        const matchesClass = advancedFilters.class === "" ||
            student.class.toLowerCase().includes(advancedFilters.class.toLowerCase());

        const matchesParentName = advancedFilters.parentName === "" ||
            student.parentName.toLowerCase().includes(advancedFilters.parentName.toLowerCase());

        const matchesStatus = filterStatus === "all" || student.status === filterStatus;

        return matchesSearch && matchesStudentId && matchesClass && matchesParentName && matchesStatus;
    });

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const clearAdvancedFilters = () => {
        setAdvancedFilters({
            studentId: "",
            class: "",
            parentName: ""
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddStudent = () => {
        if (!formData.fullName || !formData.studentId || !formData.class || !formData.email || !formData.parentName || !formData.parentPhone) {
            alert("Vui lòng điền đầy đủ thông tin học sinh!");
            return;
        }
        
        // Simple avatar generation
        const avatarInitials = formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        const newStudent: Student = {
            id: students.length + 1,
            ...formData,
            status: "active",
            registeredDate: new Date().toLocaleDateString('vi-VN'),
            avatar: avatarInitials
        };

        setStudents([...students, newStudent]);
        setShowAddModal(false);
        setFormData({ fullName: "", class: "", studentId: "", email: "", parentName: "", parentPhone: "" });
        alert("Thêm học sinh mới thành công!");
    };

    const handleEditStudent = () => {
        if (!selectedStudent) return;

        const updatedStudents = students.map(s =>
            s.id === selectedStudent.id ? {
                ...selectedStudent,
                ...formData,
                avatar: formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
            } : s
        );

        setStudents(updatedStudents);
        setShowEditModal(false);
        setSelectedStudent(null);
        setFormData({ fullName: "", class: "", studentId: "", email: "", parentName: "", parentPhone: "" });
        alert("Cập nhật thông tin học sinh thành công!");
    };

    const handleDeleteStudent = () => {
        if (!studentToDelete) return;

        setStudents(students.filter(s => s.id !== studentToDelete.id));
        setShowDeleteConfirm(false);
        setStudentToDelete(null);
        alert("Xóa học sinh thành công!");
    };

    const openEditModal = (student: Student) => {
        setSelectedStudent(student);
        setFormData({
            fullName: student.fullName,
            class: student.class,
            studentId: student.studentId,
            email: student.email,
            parentName: student.parentName,
            parentPhone: student.parentPhone,
        });
        setShowEditModal(true);
    };

    const getStatusBadge = (status: Student['status']): ReactElement => {
        switch (status) {
            case "active":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3.5 h-3.5" /> Đang học</span>;
            case "inactive":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5" /> Tạm nghỉ</span>;
            case "graduated":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"><School className="w-3.5 h-3.5" /> Đã tốt nghiệp</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Không rõ</span>;
        }
    };

    const stats = [
        { label: "Tổng số Học sinh", value: students.length.toString(), color: "bg-orange-400", icon: Users },
        { label: "Đang học", value: students.filter(s => s.status === "active").length.toString(), color: "bg-green-500", icon: CheckCircle },
        { label: "Số lớp học", value: new Set(students.map(s => s.class)).size.toString(), color: "bg-blue-400", icon: School },
        { label: "Đã tốt nghiệp", value: students.filter(s => s.status === "graduated").length.toString(), color: "bg-indigo-400", icon: UserCheck }
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý Học sinh</h1>
                    <p className="text-gray-500 text-base">Quản lý thông tin chi tiết của các học sinh trong trường</p>
                </div>
                <button
                    onClick={() => {
                        setShowAddModal(true);
                        // Clear form data when opening add modal
                        setFormData({ fullName: "", class: "", studentId: "", email: "", parentName: "", parentPhone: "" });
                    }}
                    className="flex items-center gap-2 text-white px-6 py-3 rounded-lg border-none cursor-pointer font-medium transition duration-200 shadow-md hover:bg-orange-600 active:bg-orange-700"
                    style={{ backgroundColor: PRIMARY_COLOR, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                >
                    <Plus className="w-5 h-5" />
                    Thêm học sinh mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters and Search - Divided Layout */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                {/* Bộ lọc bên trái */}
                <div className="bg-white rounded-xl p-6 shadow-md lg:w-full"> {/* Changed to full width for students page simplicity */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1 min-w-[250px] relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, mã số, lớp, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200"
                                style={{
                                    '--tw-ring-color': PRIMARY_RING
                                } as React.CSSProperties}
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
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Mã số học sinh</label>
                                    <input
                                        type="text"
                                        placeholder="VD: HS2024001"
                                        value={advancedFilters.studentId}
                                        onChange={(e) =>
                                            setAdvancedFilters({
                                                ...advancedFilters,
                                                studentId: e.target.value,
                                            })
                                        }
                                        className="p-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Lớp</label>
                                    <input
                                        type="text"
                                        placeholder="VD: 10A1"
                                        value={advancedFilters.class}
                                        onChange={(e) =>
                                            setAdvancedFilters({
                                                ...advancedFilters,
                                                class: e.target.value,
                                            })
                                        }
                                        className="p-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Tên phụ huynh</label>
                                    <input
                                        type="text"
                                        placeholder="VD: Nguyễn Văn Hùng"
                                        value={advancedFilters.parentName}
                                        onChange={(e) =>
                                            setAdvancedFilters({
                                                ...advancedFilters,
                                                parentName: e.target.value,
                                            })
                                        }
                                        className="p-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                    />
                                </div>
                            </div>
                            <button onClick={clearAdvancedFilters} className="px-5 py-2.5 rounded-lg border-none font-medium cursor-pointer transition duration-200 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2 flex-wrap mt-4">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'all' ? 'text-white bg-orange-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            style={filterStatus === 'all' ? { backgroundColor: PRIMARY_COLOR } : {}}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đang học
                        </button>
                        <button
                            onClick={() => setFilterStatus('inactive')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'inactive' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Tạm nghỉ
                        </button>
                        <button
                            onClick={() => setFilterStatus('graduated')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'graduated' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đã tốt nghiệp
                        </button>
                    </div>
                </div>

                {/* Optional: Add a visual element like a simple school map or image here if needed, or keep the full width as above */}
                {/* <div className="lg:w-1/2 h-[450px]">
                    <div className="bg-white rounded-xl shadow-md p-6 h-full flex items-center justify-center border border-dashed border-gray-300">
                        <School className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500 ml-3">Khu vực Bản đồ/Visual School Overview</p>
                    </div>
                </div> */}
            </div>


            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên học sinh</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã số & Lớp</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin liên hệ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phụ huynh</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày nhập học</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentStudents.length > 0 ? (
                                currentStudents.map((student) => (
                                    <tr key={student.id} className="border-b border-gray-100 transition duration-200 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base bg-orange-500" style={{ backgroundColor: PRIMARY_COLOR }}>{student.avatar}</div>
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 mb-0.5">{student.fullName}</p>
                                                    <p className="text-xs text-gray-500">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <UserCircle className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium">{student.studentId}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <School className="w-4 h-4 text-gray-400" />
                                                    Lớp: <span className="text-gray-900">{student.class}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {student.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <UserCheck className="w-4 h-4 text-gray-400" />
                                                    {student.parentName}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    {student.parentPhone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 whitespace-nowrap">{student.registeredDate}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(student.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => setSelectedStudent(student)} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-orange-50 text-orange-500" title="Xem chi tiết" style={{ color: PRIMARY_COLOR, '--tw-bg-opacity': 0.1 } as React.CSSProperties}><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => openEditModal(student)} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-green-100 text-green-600" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => { setStudentToDelete(student); setShowDeleteConfirm(true); }} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-red-100 text-red-600" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center p-12 text-gray-500">Không tìm thấy học sinh nào phù hợp với điều kiện tìm kiếm.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredStudents.length > 0 && (
                    <div className="flex justify-between items-center p-6 bg-white border-t border-gray-200 flex-wrap gap-4">
                        <div className="text-gray-500 text-sm">
                            Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredStudents.length)} trong tổng số {filteredStudents.length} học sinh
                        </div>
                        <div className="flex gap-2 items-center">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2.5 border border-gray-300 bg-white rounded-md cursor-pointer transition duration-200 text-sm min-w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-orange-500"><ChevronLeft className="w-4 h-4" /></button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-3 py-2 border rounded-md cursor-pointer transition duration-200 text-sm font-medium min-w-10 ${currentPage === index + 1 ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-orange-500'}`}
                                    style={currentPage === index + 1 ? { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR } : {}}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2.5 border border-gray-300 bg-white rounded-md cursor-pointer transition duration-200 text-sm min-w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-orange-500"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Student Detail Modal */}
            {selectedStudent && !showEditModal && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ backgroundColor: PRIMARY_COLOR }}>{selectedStudent.avatar}</div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{selectedStudent.fullName}</h2>
                                    <p className="text-gray-500 text-sm">Mã số: {selectedStudent.studentId} | Ngày nhập học: {selectedStudent.registeredDate}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="bg-transparent border-none text-gray-400 text-3xl cursor-pointer p-0 leading-none transition duration-200 hover:text-gray-700">×</button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin cơ bản</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div><p className="text-sm text-gray-500 mb-1">Lớp</p><p className="text-base text-gray-900 font-medium">{selectedStudent.class}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">Email</p><p className="text-base text-gray-900 font-medium">{selectedStudent.email}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">Tên Phụ huynh</p><p className="text-base text-gray-900 font-medium">{selectedStudent.parentName}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">SĐT Phụ huynh</p><p className="text-base text-gray-900 font-medium">{selectedStudent.parentPhone}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">Trạng thái</p>{getStatusBadge(selectedStudent.status)}</div>
                                </div>
                            </div>

                            {/* Additional Section: Example of linked data (e.g., Address) */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Home className="w-5 h-5" /> Địa chỉ (Mô phỏng)</h3>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-900">123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
                                    <p className="text-xs text-gray-500 mt-1">*(Chưa có trong dữ liệu mẫu, chỉ để minh họa)*</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => openEditModal(selectedStudent)} className="flex-1 px-4 py-3 border-none rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 active:bg-green-800"><Edit className="w-4.5 h-4.5" />Chỉnh sửa</button>
                                <button onClick={() => { setStudentToDelete(selectedStudent); setShowDeleteConfirm(true); setSelectedStudent(null); }} className="flex-1 px-4 py-3 border-none rounded-lg font-medium cursor-pointer transition duration-200 flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 active:bg-red-800"><Trash2 className="w-4.5 h-4.5" />Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Student Modal */}
            {(showAddModal || showEditModal) && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-gray-900">{showAddModal ? "Thêm Học sinh mới" : "Chỉnh sửa Học sinh"}</h2>
                            <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedStudent(null); setFormData({ fullName: "", class: "", studentId: "", email: "", parentName: "", parentPhone: "" }); }} className="bg-transparent border-none text-gray-400 text-3xl cursor-pointer p-0 leading-none transition duration-200 hover:text-gray-700">×</button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Họ và Tên</label>
                                    <input type="text" name="fullName" placeholder="VD: Nguyễn Văn A" value={formData.fullName} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm text-gray-700 font-medium mb-1.5">Mã số học sinh</label>
                                        <input type="text" name="studentId" placeholder="VD: HS2024001" value={formData.studentId} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm text-gray-700 font-medium mb-1.5">Lớp</label>
                                        <input type="text" name="class" placeholder="VD: 10A1" value={formData.class} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Email</label>
                                    <input type="email" name="email" placeholder="VD: vanana@school.com" value={formData.email} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Tên Phụ huynh</label>
                                    <input type="text" name="parentName" placeholder="VD: Nguyễn Văn Hùng" value={formData.parentName} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">SĐT Phụ huynh</label>
                                    <input type="tel" name="parentPhone" placeholder="VD: 09xxxxxxxx" value={formData.parentPhone} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedStudent(null); setFormData({ fullName: "", class: "", studentId: "", email: "", parentName: "", parentPhone: "" }); }} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 font-medium cursor-pointer transition duration-200 text-gray-700 hover:bg-gray-50">Hủy</button>
                                <button
                                    onClick={showAddModal ? handleAddStudent : handleEditStudent}
                                    className="flex-1 px-4 py-3 rounded-lg border-none font-medium cursor-pointer transition duration-200 text-white"
                                    style={{ backgroundColor: PRIMARY_COLOR, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                >
                                    {showAddModal ? "Thêm mới" : "Cập nhật"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex flex-col items-center text-center">
                            <Trash2 className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa học sinh</h3>
                            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa học sinh **{studentToDelete?.fullName}** ra khỏi hệ thống không? Hành động này không thể hoàn tác.</p>
                            <div className="flex gap-4 w-full">
                                <button onClick={() => { setShowDeleteConfirm(false); setStudentToDelete(null); }} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 font-medium cursor-pointer transition duration-200 text-gray-700 hover:bg-gray-50">Hủy</button>
                                <button onClick={handleDeleteStudent} className="flex-1 px-4 py-3 rounded-lg border-none font-medium cursor-pointer transition duration-200 text-white bg-red-600 hover:bg-red-700">Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Export the component if you want to use it in your application entry point
// export default StudentsPage;