"use client";

import React, { useState, ReactElement, useEffect } from "react";
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
    routeID: string
}

// Interface for the form data (Add/Edit)
interface FormData {
    FullName: string;
    ParentID: string;
    DateOfBirth: String;
    PickUpPoint: string;
    DropOffPoint: string;
    routeID: string;
}

// Interface for advanced filters
interface AdvancedFilters {
    StudentID: string;
    ParentName: string;
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
    const [parents, setParents] = useState([])
    const [formData, setFormData] = useState<FormData>({
        FullName: "",
        ParentID: "",
        DateOfBirth: '',
        PickUpPoint: '',
        DropOffPoint: '',
        routeID: '',
    });
    useEffect(() => {
        fetch('http://localhost:5000/api/students')
            .then(res => res.json())
            .then(data => {

                if (Array.isArray(data)) {
                    //  trường hợp trả mảng trực tiếp
                    setStudents(data);
                } else if (Array.isArray(data.mergedData)) {
                    //  trường hợp backend trả { mergedData: [...] }
                    setStudents(data.mergedData);
                } else {
                    console.warn("⚠️ Dữ liệu trả về không phải array:", data);
                    setStudents([]); // fallback
                }
            })
            .catch(err => console.error(" Lỗi fetch:", err));
    }
        , [])
    const itemsPerPage = 6;

    // Filter logic for students
    const filteredStudents = students.filter(student => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = String(student.FullName).toLowerCase().includes(searchTermLower) ||
            String(student.StudentID).toLowerCase().includes(searchTermLower)

        const matchesStudentId = advancedFilters.StudentID === ""
        String(student.StudentID).toLowerCase().includes(advancedFilters.StudentID.toLowerCase());


        const matchesParentName = advancedFilters.ParentName === "" ||
            String(student.ParentName).toLowerCase().includes(advancedFilters.ParentName.toLowerCase());


        return matchesSearch && matchesStudentId && matchesParentName;
    });
    const formatDate = (day: any) => {
        if (!day) return ""; // nếu không có dữ liệu thì trả về rỗng tránh crash
        const date = new Date(day);

        if (isNaN(date.getTime())) return ""; // kiểm tra có phải ngày hợp lệ không

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
    };

    const handleAddStudent = async (e: any) => {
        e.preventDefault();
        if (!formData.FullName || !formData.ParentID || !formData.PickUpPoint || !formData.DropOffPoint) {
            alert("Vui lòng điền đầy đủ thông tin học sinh!");
            return;
        }
        try {

            const response = await fetch('http://localhost:5000/api/students/add', {
                method: 'POST',
                headers: { "content-type": 'application/json' },
                body: JSON.stringify(formData)
            })


            if (response.ok) {

                const data = await response.json();

                if (data) setStudents([...students, data.student]);
                alert('thêm học sinh thành công');
                setShowAddModal(false);
            } else {
                alert('có lỗi xảy ra')
            }
        } catch (err) {
            console.error(err)
        }
        setFormData({ FullName: "", ParentID: "", DateOfBirth: '', PickUpPoint: '', DropOffPoint: '', routeID: '' });

    };

    const handleEditStudent = async (e: any) => {
        e.preventDefault();
        if (!formData.DateOfBirth || !formData.FullName || !formData.DropOffPoint || !formData.PickUpPoint)
            alert('nhap day du cac field')
        try {
            const response = await fetch(`http://localhost:5000/api/students/edit/${selectedStudent && selectedStudent.StudentID}`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setStudents((prevStudents) =>
                        prevStudents.map((student) =>
                            student.StudentID.toString() === data.student.StudentID.toString()
                                ? data.student
                                : student
                        )
                    );
                }
            }
        } catch (err) {
            console.error(err)
        }


        if (!selectedStudent) return;

        // const updatedStudents = students.map(s =>
        //     s.id === selectedStudent.id ? {
        //         ...selectedStudent,
        //         ...formData,
        //         avatar: formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        //     } : s
        // );

        // setStudents(updatedStudents);
        setShowEditModal(false)
        setSelectedStudent(null);
        setFormData({ FullName: "", ParentID: "", DateOfBirth: '', PickUpPoint: '', DropOffPoint: '', routeID: '' });
        alert("Cập nhật thông tin học sinh thành công!");
    };

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;
        try {
            const response = await fetch(`http://localhost:5000/api/students/delete/${studentToDelete && studentToDelete.StudentID}`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
            })
            if (response.ok) {
                const cloneStudents = students.filter((student) => student.StudentID !== studentToDelete.StudentID)
                setStudents(cloneStudents)
            }
        } catch (err) {
            console.error(err)
        }
        // setStudents(students.filter(s => s.id !== studentToDelete.id));
        setShowDeleteConfirm(false);
        setStudentToDelete(null);
        alert("Xóa học sinh thành công!");
    };

    const openEditModal = (student: Student) => {
        setSelectedStudent(student);
        setFormData({
            FullName: student.FullName,
            routeID: student.routeID,
            ParentID: student.ParentID,
            DateOfBirth: student.DateOfBirth,

            PickUpPoint: student.PickUpPoint,
            DropOffPoint: student.DropOffPoint,
        });
        setShowEditModal(true);
    };

    // const getStatusBadge = (status: Student['status']): ReactElement => {
    //     switch (status) {
    //         case "active":
    //             return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3.5 h-3.5" /> Đang học</span>;
    //         case "inactive":
    //             return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5" /> Tạm nghỉ</span>;
    //         case "graduated":
    //             return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"><School className="w-3.5 h-3.5" /> Đã tốt nghiệp</span>;
    //         default:
    //             return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Không rõ</span>;
    //     }
    // };

    const stats = [
        { label: "Tổng số Học sinh", value: students.length.toString(), color: "bg-orange-400", icon: Users },
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
                        // Clear form data when opening add modal
                        setFormData({ FullName: "", ParentID: "", DateOfBirth: '', PickUpPoint: '', DropOffPoint: '', routeID: '' });
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã số</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phụ huynh</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày sinh</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm đón</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm Trả</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã tuyến</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>

                            {currentStudents.length > 0 ? (
                                currentStudents.map((student) => (
                                    <tr key={student.StudentID} className="border-b border-gray-100 transition duration-200 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base bg-orange-500" style={{ backgroundColor: PRIMARY_COLOR }}>{student.avatar}</div> */}
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 mb-0.5">{student.FullName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <School className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900 mb-0.5">HS-{student.StudentID}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900 mb-0.5">{student.ParentName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <UserCheck className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900 mb-0.5">{formatDate(student.DateOfBirth)}</p>
                                                    </div>
                                                </div>

                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <UserCheck className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900 mb-0.5">{student.PickUpPoint}</p>
                                                    </div>
                                                </div>

                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <UserCheck className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900 mb-0.5">{student.DropOffPoint}</p>
                                                    </div>
                                                </div>

                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <UserCheck className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900 mb-0.5">{student.routeID}</p>
                                                    </div>
                                                </div>

                                            </div>
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
                    <div suppressHydrationWarning={true} className="flex justify-between items-center p-6 bg-white border-t border-gray-200 flex-wrap gap-4">
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
                                {/* <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ backgroundColor: PRIMARY_COLOR }}>{selectedStudent.avatar}</div> */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{selectedStudent.FullName}</h2>
                                    <p className="text-gray-500 text-sm">Mã số: {selectedStudent.StudentID}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="bg-transparent border-none text-gray-400 text-3xl cursor-pointer p-0 leading-none transition duration-200 hover:text-gray-700">×</button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin cơ bản</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                                    <div><p className="text-sm text-gray-500 mb-1">Tên Phụ huynh</p><p className="text-base text-gray-900 font-medium">{selectedStudent.ParentName}</p></div>
                                    <div><p className="text-sm text-gray-500 mb-1">SĐT Phụ huynh</p><p className="text-base text-gray-900 font-medium">{5}</p></div>

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
                <form>
                    <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                                <h2 className="text-2xl font-bold text-gray-900">{showAddModal ? "Thêm Học sinh mới" : "Chỉnh sửa Học sinh"}</h2>
                                <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedStudent(null); setFormData({ FullName: "", ParentID: "", DateOfBirth: '', PickUpPoint: '', DropOffPoint: '', routeID: '' }); }} className="bg-transparent border-none text-gray-400 text-3xl cursor-pointer p-0 leading-none transition duration-200 hover:text-gray-700">×</button>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm text-gray-700 font-medium mb-1.5">Họ và Tên</label>
                                        <input type="text" name="FullName" placeholder="VD: Nguyễn Văn A" value={formData.FullName} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                    </div>
                                    {/* <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm text-gray-700 font-medium mb-1.5">Lớp</label>
                                        <input type="text" name="class" placeholder="VD: 10A1" value={formData.class} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                    </div>
                                      <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Mã Phụ huynh</label>
                                    <input type="text" name="ParentID" placeholder="VD: 2000" value={formData.ParentID} onChange={handle} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                </div>

                                </div> */}
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="ParentID"
                                            className="text-sm text-gray-700 font-medium mb-1.5"
                                        >
                                            Phụ huynh (Parent ID)
                                        </label>
                                        <input
                                            type="text"
                                            id="ParentID"
                                            name="ParentID"
                                            value={formData.ParentID}
                                            onChange={handleInputChange}
                                            placeholder="Nhập Parent ID"
                                            className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                            required
                                        />
                                    </div>
                                    {/* <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Email</label>
                                    <input type="email" name="email" placeholder="VD: vanana@school.com" value={formData.email} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                </div> */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <label className="text-sm text-gray-700 font-medium mb-1.5">Date Of Birth: </label>
                                            <input type="date" name="DateOfBirth" placeholder="VD: 2007-12-06" value={formData.DateOfBirth ? formatDate(formData.DateOfBirth?.toString()) : ''} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                        </div>
                                        {/* <div className="flex flex-col">
                                    <label className="text-sm text-gray-700 font-medium mb-1.5">Ngày Đăng Kí: </label>
                                    <input type="date" name="registeredDate" placeholder="VD: 2007-12-07" value={formData.registeredDate} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                </div> */}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm text-gray-700 font-medium mb-1.5">Mã tuyến: </label>
                                        <input type="text" name="routeID" placeholder="VD: 1" value={formData.routeID} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm text-gray-700 font-medium mb-1.5">Pick up point: </label>
                                        <input type="text" name="PickUpPoint" placeholder="VD: 22/1 Đồng Đen,Phường 5, Quận Tân Bình, TPHCM" value={formData.PickUpPoint} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm text-gray-700 font-medium mb-1.5">drop off point: </label>
                                        <input type="text" name="DropOffPoint" placeholder="VD: 22/1 Đồng Đen,Phường 5, Quận Tân Bình, TPHCM" value={formData.DropOffPoint} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" required />
                                    </div>

                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedStudent(null); setFormData({ FullName: "", ParentID: "", DateOfBirth: '', PickUpPoint: '', DropOffPoint: '', routeID: '' }); }} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 font-medium cursor-pointer transition duration-200 text-gray-700 hover:bg-gray-50">Hủy</button>
                                    <button
                                        type="submit"
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

                </form>

            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex flex-col items-center text-center">
                            <Trash2 className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa học sinh</h3>
                            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa học sinh **{studentToDelete?.FullName}** ra khỏi hệ thống không? Hành động này không thể hoàn tác.</p>
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