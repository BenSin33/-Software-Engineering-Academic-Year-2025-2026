"use client";

import { useState, useEffect } from "react";
import { Users, Phone, Mail, MapPin, UserCircle, Search, Plus, Edit, Trash2, Eye, School, ChevronLeft, ChevronRight, Filter, Route as RouteIcon, UserCheck, CheckCircle, XCircle, Home } from "lucide-react";

// --- Data Models ---

// Interface for a single student
interface Student {
    StudentID: string,
    ParentName: string,
    ParentID: string,
    FullName: string,
    DateOfBirth: String,
    PickUpPoint: string,
    DropOffPoint: string,
    routeID: string,
    status?: string
}

// Interface for the form data (Add/Edit)
interface FormData {
    FullName: string;
    ParentID: string;
    DateOfBirth: String;
    PickUpPoint: string;
    DropOffPoint: string;
    routeID: string;
    status: string;
}

// Interface for advanced filters
interface AdvancedFilters {
    StudentID: string;
    ParentName: string;
}

interface Route {
    RouteID: string;
    RouteName: string;
}

// --- Màu sắc tùy chỉnh (Orange-Yellow: #FFAC50, Dark Hover: #E59B48) ---
const PRIMARY_COLOR = "#FFAC50";
const PRIMARY_HOVER = "#E59B48";
const PRIMARY_RING = "rgba(255, 172, 80, 0.3)";

export default function StudentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null)
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
        StudentID: "",
        ParentName: ""
    });

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

    // Sample data for students
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<any[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [formData, setFormData] = useState<FormData>({
        FullName: "",
        ParentID: "",
        DateOfBirth: '',
        PickUpPoint: '',
        DropOffPoint: '',
        routeID: '',
        status: 'active'
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch students
    const fetchStudents = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/students');
            const data = await res.json();
            if (Array.isArray(data)) {
                setStudents(data);
            } else if (Array.isArray(data.mergedData)) {
                setStudents(data.mergedData);
            } else {
                console.warn("⚠️ Dữ liệu trả về không phải array:", data);
                setStudents([]);
            }
        } catch (err) {
            console.error("Lỗi fetch students:", err);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Fetch parents
    useEffect(() => {
        fetch('http://localhost:5012/api/parents')
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    setParents(data.data);
                } else if (Array.isArray(data)) {
                    setParents(data);
                } else {
                    console.warn("⚠️ Dữ liệu phụ huynh không hợp lệ:", data);
                    setParents([]);
                }
            })
            .catch(err => console.error("Lỗi fetch parents:", err));
    }, []);

    // Fetch routes
    useEffect(() => {
        fetch('http://localhost:5003/Routes')
            .then(res => res.json())
            .then(data => {
                if (data.routes && Array.isArray(data.routes)) {
                    setRoutes(data.routes);
                } else if (Array.isArray(data)) {
                    setRoutes(data);
                } else {
                    console.warn("⚠️ Dữ liệu tuyến không hợp lệ:", data);
                    setRoutes([]);
                }
            })
            .catch(err => console.error("Lỗi fetch routes:", err));
    }, []);

    const itemsPerPage = 6;

    // Filter logic for students
    const filteredStudents = students.filter(student => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = String(student.FullName).toLowerCase().includes(searchTermLower) ||
            String(student.StudentID).toLowerCase().includes(searchTermLower)

        const matchesStudentId = advancedFilters.StudentID === "" ||
            String(student.StudentID).toLowerCase().includes(advancedFilters.StudentID.toLowerCase());

        const matchesParentName = advancedFilters.ParentName === "" ||
            String(student.ParentName).toLowerCase().includes(advancedFilters.ParentName.toLowerCase());

        const matchesStatus = filterStatus === "all" || student.status === filterStatus;

        return matchesSearch && matchesStudentId && matchesParentName && matchesStatus;
    });

    const formatDate = (day: any) => {
        if (!day) return "";
        const date = new Date(day);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split("T")[0];
    };

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const clearAdvancedFilters = () => {
        setAdvancedFilters({
            StudentID: "",
            ParentName: ""
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        console.log('fomr: ',formData)
        if (!formData.FullName.trim()) {
            errors.FullName = 'Vui lòng nhập họ tên học sinh';
        } else if (formData.FullName.trim().length < 3) {
            errors.FullName = 'Họ tên phải có ít nhất 3 ký tự';
        }

        if (!formData.ParentID) {
            errors.ParentID = 'Vui lòng chọn phụ huynh';
        }

        if (!formData.DateOfBirth) {
            errors.DateOfBirth = 'Vui lòng chọn ngày sinh';
        } else {
            const birthDate = new Date(formData.DateOfBirth.toString());
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 3 || age > 18) {
                errors.DateOfBirth = 'Học sinh phải từ 3-18 tuổi';
            }
        }

        if (!formData.PickUpPoint.trim()) {
            errors.PickUpPoint = 'Vui lòng nhập điểm đón';
        }

        if (!formData.DropOffPoint.trim()) {
            errors.DropOffPoint = 'Vui lòng nhập điểm trả';
        }

        if (!formData.routeID) {
            errors.routeID = 'Vui lòng chọn mã tuyến';
        }

        if (!formData.status) {
            errors.status = 'Vui lòng chọn trạng thái';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddStudent = async (e: any) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/students/add', {
                method: 'POST',
                headers: { "content-type": 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                await fetchStudents(); // Refetch students
                alert('Thêm học sinh thành công');
                setShowAddModal(false);
                setFormData({ FullName: "", ParentID: "", DateOfBirth: '', PickUpPoint: '', DropOffPoint: '', routeID: '', status: 'active' });
                setFormErrors({});
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.error(err);
            alert('Không thể kết nối đến server');
        }
    };

    const handleEditStudent = async (e: any) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!selectedStudent) return;

        try {
            const response = await fetch(`http://localhost:5000/api/students/edit/${selectedStudent.StudentID}`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                await fetchStudents(); // Refetch students
                alert("Cập nhật thông tin học sinh thành công!");
                setShowEditModal(false);
                setSelectedStudent(null);
                setFormData({ FullName: "", ParentID: "", DateOfBirth: '', PickUpPoint: '', DropOffPoint: '', routeID: '', status: 'active' });
                setFormErrors({});
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.error(err);
            alert('Không thể kết nối đến server');
        }
    };

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;
        try {
            const response = await fetch(`http://localhost:5000/api/students/delete/${studentToDelete.StudentID}`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
            })
            if (response.ok) {
                await fetchStudents(); // Refetch students
                alert("Xóa học sinh thành công!");
            }
        } catch (err) {
            console.error(err);
            alert('Không thể xóa học sinh');
        }
        setShowDeleteConfirm(false);
        setStudentToDelete(null);
    };

    const openEditModal = (student: Student) => {
        setSelectedStudent(student);
        setStudentToEdit(student);
        setFormData({
            FullName: student.FullName,
            routeID: student.routeID,
            ParentID: student.ParentID,
            DateOfBirth: student.DateOfBirth,
            PickUpPoint: student.PickUpPoint,
            DropOffPoint: student.DropOffPoint,
            status: student.status || 'active'
        });
        setShowEditModal(true);
    };

    const getStatusBadge = (status?: string) => {
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
        { label: "Đang học", value: students.filter(s => s.status === 'active').length.toString(), color: "bg-green-400", icon: CheckCircle },
        { label: "Tạm nghỉ", value: students.filter(s => s.status === 'inactive').length.toString(), color: "bg-red-400", icon: XCircle },
        { label: "Đã tốt nghiệp", value: students.filter(s => s.status === 'graduated').length.toString(), color: "bg-indigo-400", icon: School },
    ];

    return (
        <div className="p-8 bg-gray-50 w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý Học sinh</h1>
                    <p className="text-gray-500 text-base">Quản lý thông tin chi tiết của các học sinh trong trường</p>
                </div>
                <button
                    onClick={() => {
                        setShowAddModal(true);
                        setFormData({ FullName: "", ParentID: "", DateOfBirth: '', PickUpPoint: '', DropOffPoint: '', routeID: '', status: 'active' });
                        setFormErrors({});
                    }}
                    suppressHydrationWarning={true}
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

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md lg:w-full">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1 min-w-[250px] relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, mã số..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200"
                                suppressHydrationWarning={true}
                                style={{
                                    '--tw-ring-color': PRIMARY_RING
                                } as React.CSSProperties}
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
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Mã số học sinh</label>
                                    <input
                                        type="text"
                                        placeholder="VD: HS2024001"
                                        value={advancedFilters.StudentID}
                                        onChange={(e) =>
                                            setAdvancedFilters({
                                                ...advancedFilters,
                                                StudentID: e.target.value,
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
                                        value={advancedFilters.ParentName}
                                        onChange={(e) =>
                                            setAdvancedFilters({
                                                ...advancedFilters,
                                                ParentName: e.target.value,
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
                            suppressHydrationWarning={true}
                            onClick={() => setFilterStatus('all')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'all' ? 'text-white bg-orange-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            style={filterStatus === 'all' ? { backgroundColor: PRIMARY_COLOR } : {}}
                        >
                            Tất cả
                        </button>
                        <button
                            suppressHydrationWarning={true}
                            onClick={() => setFilterStatus('active')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đang học
                        </button>
                        <button
                            suppressHydrationWarning={true}
                            onClick={() => setFilterStatus('inactive')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'inactive' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Tạm nghỉ
                        </button>
                        <button
                            suppressHydrationWarning={true}
                            onClick={() => setFilterStatus('graduated')}
                            className={`px-5 py-3 rounded-lg font-medium border-none cursor-pointer transition duration-200 text-sm ${filterStatus === 'graduated' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Đã tốt nghiệp
                        </button>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên học sinh</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã số</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phụ huynh</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày sinh</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã tuyến</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentStudents.length > 0 ? (
                                currentStudents.map((student) => (
                                    <tr key={student.StudentID} className="border-b border-gray-100 transition duration-200 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-sm text-gray-900">{student.FullName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <School className="w-4 h-4 text-gray-400" />
                                                <p className="font-medium text-sm text-gray-900">HS-{student.StudentID}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <UserCheck className="w-4 h-4 text-gray-400" />
                                                <p className="font-medium text-sm text-gray-900">{student.ParentName}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">{formatDate(student.DateOfBirth)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <RouteIcon className="w-4 h-4 text-gray-400" />
                                                <p className="font-medium text-sm text-gray-900">{student.routeID}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(student.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => setSelectedStudent(student)} className="p-2 rounded-lg cursor-pointer transition duration-200 hover:scale-110 hover:bg-orange-50 text-orange-500" title="Xem chi tiết" style={{ color: PRIMARY_COLOR }}><Eye className="w-4 h-4" /></button>
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
                            Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredStudents.length)} trong tổng số {filteredStudents.length} Học sinh
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


            {/* Student Detail Modal */}
            {selectedStudent && !showEditModal && (
                <Modal title="Chi tiết học sinh" isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} size="md">
                    <div className="space-y-4">
                        {/* Header với Avatar */}
                        <div className="flex items-center gap-4 border-b pb-4 mb-4">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <School className="w-10 h-10 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{selectedStudent.FullName}</h2>
                                <p className="text-gray-500 text-sm">
                                    Mã số: <strong>HS-{selectedStudent.StudentID}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Grid thông tin */}
                        <div className="grid grid-cols-1 gap-3">
                            <DetailItem label="Họ tên" value={selectedStudent.FullName} icon={UserCircle} />
                            <DetailItem label="Mã số học sinh" value={`HS-${selectedStudent.StudentID}`} icon={School} />
                            <DetailItem label="Phụ huynh" value={selectedStudent.ParentName || 'Không rõ'} icon={Users} />
                            <DetailItem label="Mã phụ huynh" value={selectedStudent.ParentID || 'Không rõ'} icon={UserCheck} />
                            <DetailItem label="Ngày sinh" value={formatDate(selectedStudent.DateOfBirth)} icon={School} />
                            <DetailItem label="Điểm đón" value={selectedStudent.PickUpPoint} icon={MapPin} />
                            <DetailItem label="Điểm trả" value={selectedStudent.DropOffPoint} icon={Home} />
                            <DetailItem label="Mã tuyến" value={selectedStudent.routeID} icon={RouteIcon} />

                            {/* Trạng thái */}
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-gray-500 font-medium text-xs uppercase mb-0.5">Trạng thái</p>
                                    <div className="mt-1">{getStatusBadge(selectedStudent.status)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nút đóng */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className="px-4 py-2 text-white rounded-lg font-medium transition duration-200 shadow-md hover:opacity-90"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                        >
                            Đóng
                        </button>
                    </div>
                </Modal>
            )}

            {/* Add Student Modal */}
            <StudentFormModal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); setFormErrors({}); setFormData({ FullName: "", ParentID: "", DateOfBirth: '', PickUpPoint: '', DropOffPoint: '', routeID: '', status: 'active' }); }}
                title="Thêm học sinh mới"
                onSubmit={handleAddStudent}
                formData={formData}
                formErrors={formErrors}
                onInputChange={handleInputChange}
                parents={parents}
                routes={routes}
                isEdit={false}
            />

            {/* Edit Student Modal */}
            <StudentFormModal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setSelectedStudent(null); setFormErrors({}); setFormData({ FullName: "", ParentID: "", DateOfBirth: '', PickUpPoint: '', DropOffPoint: '', routeID: '', status: 'active' }); }}
                title={`Chỉnh sửa: ${selectedStudent?.FullName}`}
                onSubmit={handleEditStudent}
                formData={formData}
                formErrors={formErrors}
                onInputChange={handleInputChange}
                parents={parents}
                routes={routes}
                isEdit={true}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <ConfirmModal
                    isOpen={showDeleteConfirm}
                    onClose={() => { setShowDeleteConfirm(false); setStudentToDelete(null); }}
                    onConfirm={handleDeleteStudent}
                    title="Xác nhận xóa học sinh"
                    description={`Bạn có chắc chắn muốn xóa học sinh ${studentToDelete?.FullName} (Mã số: HS-${studentToDelete?.StudentID}) không? Thao tác này không thể hoàn tác.`}
                    confirmButtonText="Xóa"
                />
            )}
        </div>
    );
}

// --- Component hỗ trợ ---

// 1. Modal Component (Generic)
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
    size?: "sm" | "md" | "lg";
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "md" }) => {
    if (!isOpen) return null;

    const maxWidth = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

    return (
        <div
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-xl shadow-2xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100`}
                onClick={(e) => e.stopPropagation()}
            >
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

// 2. Student Form Modal
interface StudentFormModalProps extends ModalProps {
    onSubmit: (e: React.FormEvent) => Promise<void>;
    formData: FormData;
    formErrors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    parents: any[];
    routes: Route[];
    isEdit: boolean;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({
    isOpen, onClose, title, onSubmit,
    formData, formErrors, onInputChange,
    parents, routes, isEdit
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    {/* FullName */}
                    <FormInput
                        label="Họ tên học sinh *"
                        name="FullName"
                        value={formData.FullName}
                        onChange={onInputChange}
                        error={formErrors.FullName}
                        placeholder="Nhập họ tên (VD: Nguyễn Văn A)"
                        icon={UserCircle}
                    />

                    {/* DateOfBirth */}
                    <FormInput
                        label="Ngày sinh *"
                        name="DateOfBirth"
                        value={formData.DateOfBirth.toString()}
                        onChange={onInputChange}
                        error={formErrors.DateOfBirth}
                        type="date"
                        icon={School}
                    />

                    {/* ParentID */}
                    <FormSelect
                        label="Phụ huynh *"
                        name="ParentID"
                        value={formData.ParentID}
                        onChange={onInputChange}
                        error={formErrors.ParentID}
                        icon={Users}
                        options={parents.map(p => ({ value: p.ParentID, label: `${p.FullName} (Mã: ${p.ParentID})` }))}
                        defaultOptionLabel="-- Chọn phụ huynh --"
                    />

                    {/* RouteID */}
                    <FormSelect
                        label="Mã tuyến *"
                        name="routeID"
                        value={formData.routeID}
                        onChange={onInputChange}
                        error={formErrors.routeID}
                        icon={RouteIcon}
                        options={routes.map(r => ({ value: r.RouteID, label: `${r.RouteName} (${r.RouteID})` }))}
                        defaultOptionLabel="-- Chọn mã tuyến --"
                    />

                    {/* PickUpPoint */}
                    <FormInput
                        label="Điểm đón *"
                        name="PickUpPoint"
                        value={formData.PickUpPoint}
                        onChange={onInputChange}
                        error={formErrors.PickUpPoint}
                        placeholder="Nhập địa chỉ điểm đón"
                        icon={MapPin}
                    />

                    {/* DropOffPoint */}
                    <FormInput
                        label="Điểm trả *"
                        name="DropOffPoint"
                        value={formData.DropOffPoint}
                        onChange={onInputChange}
                        error={formErrors.DropOffPoint}
                        placeholder="Nhập địa chỉ điểm trả"
                        icon={Home}
                    />

                    {/* Status */}
                    <FormSelect
                        label="Trạng thái *"
                        name="status"
                        value={formData.status}
                        onChange={onInputChange}
                        error={formErrors.status}
                        icon={CheckCircle}
                        options={[
                            { value: 'active', label: 'Đang học' },
                            { value: 'inactive', label: 'Tạm nghỉ' },
                            { value: 'graduated', label: 'Đã tốt nghiệp' },
                        ]}
                        defaultOptionLabel="-- Chọn trạng thái --"
                    />
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white rounded-lg font-medium transition duration-200 shadow-md hover:opacity-90"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                        {isEdit ? "Cập nhật" : "Thêm mới"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// 3. Form Input Component
interface FormInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    error?: string;
    type?: string;
    placeholder?: string;
    icon: React.ElementType;
}

const FormInput: React.FC<FormInputProps> = ({
    label, name, value, onChange, error,
    type = "text", placeholder, icon: Icon
}) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full p-2.5 border text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'}`}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);
// 4. Form Select Component
interface FormSelectProps extends Omit<FormInputProps, 'type' | 'placeholder' | 'value'> {
    value: string;
    options: { value: string; label: string }[];
    defaultOptionLabel: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
    label, name, value, onChange, error,
    options, defaultOptionLabel, icon: Icon
}) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full p-2.5 border text-sm rounded-lg appearance-none transition-all duration-200 focus:outline-none focus:ring-2 bg-white ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'}`}
        >
            <option value="" disabled>{defaultOptionLabel}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);

// 5. Confirm Modal Component
interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
    onConfirm: () => void;
    description: string;
    confirmButtonText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen, onClose, title, onConfirm, description, confirmButtonText = "Xác nhận"
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="p-2 space-y-6">
                <p className="text-gray-700">{description}</p>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 font-medium cursor-pointer transition duration-200 text-gray-700 hover:bg-gray-100"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-5 py-2.5 rounded-lg border-none cursor-pointer font-medium transition duration-200 text-white shadow-md bg-red-600 hover:bg-red-700 active:bg-red-800"
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// 6. Detail Item Component
interface DetailItemProps {
    icon: React.ElementType;
    label: string;
    value: string | React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <Icon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
            <p className="text-gray-500 font-medium text-xs uppercase mb-0.5">{label}</p>
            <p className="font-semibold text-gray-900 text-sm break-words">{value}</p>
        </div>
    </div>
);