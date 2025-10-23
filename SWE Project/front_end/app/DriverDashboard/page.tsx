"use client";

import React, { useState } from 'react';
import { Search, Settings, AlertTriangle, Bus, MapPin, Bell } from 'lucide-react';
import Image from 'next/image';
import './DriverJourney.css'; 

// Component Toggle Switch tùy chỉnh
type ToggleSwitchProps = {
  checked: boolean;
  onChange: () => void;
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
  <label className="switch">
    <input type="checkbox" checked={checked} onChange={() => onChange()} />
    <span className="slider round"></span>
  </label>
);

export default function DriverJourneyPage() {
  // Dữ liệu giả lập cho danh sách học sinh
  const initialStudents = [
    { id: 1, name: 'Nguyễn Văn A', status: 'Chưa đón' },
    { id: 2, name: 'Nguyễn Văn/Trà', status: 'Đã đón' },
    { id: 3, name: 'Điểm đón/Trà', status: 'Đã đón' },
    { id: 4, name: 'Nguyễn Văn A', status: 'Đã đón' },
    { id: 5, name: 'Druyền số 10', status: 'Đã đón' },
    { id: 6, name: 'Nguyễn Văn A', status: 'Đã đón' },
    { id: 7, name: 'Nguyễn Văn A', status: 'Đã đón' },
    { id: 8, name: 'Druyền số 10', status: 'Đã đón' },
  ];

  const [students, setStudents] = useState(initialStudents);

  const handleToggle = (id: number) => {
    setStudents(students.map(student =>
      student.id === id
        ? { ...student, status: student.status === 'Đã đón' ? 'Chưa đón' : 'Đã đón' }
        : student
    ));
  };

  return (
    <div className="driver-journey-page">
      {/* Header của trang */}
      <div className="page-main-header">
        <div className="user-actions">
          <button className="report-button">
            <AlertTriangle size={16} />
            BÁO CÁO SỰ CỐ
          </button>
        </div>
      </div>

      <div className="journey-content-grid">
        {/* Cột nội dung chính */}
        <div className="main-content">
          <p className="page-breadcrumb">Lịch trình</p>
          
          {/* Thẻ Lịch trình ngày hôm nay */}
          <div className="card current-trip-card">
            <div className="card-icon-wrapper">
              <Bus size={32} />
            </div>
            <div className="card-content">
              <h4>LỊCH TRÌNH NGÀY HÔM NAY</h4>
              <p className="trip-status">Đang chạy</p>
              <p className="trip-time">Chuyến sáng: 07:00 - 08:30</p>
            </div>
          </div>

          {/* Danh sách học sinh */}
          <div className="card student-list-card">
            <h4>DANH SÁCH HỌC SINH</h4>
            <div className="student-list">
              <div className="list-header">
                <span>Tên học sinh</span>
                <span>Trạng thái</span>
              </div>
              {students.map((student) => (
                <div key={student.id} className="student-item">
                  <span className="student-name">{student.name}</span>
                  <div className="student-status">
                    <span>{student.status === 'Đã đón' ? 'Đã đón' : 'Chưa đón'}</span>
                    <ToggleSwitch
                      checked={student.status === 'Đã đón'}
                      onChange={() => handleToggle(student.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột bên phải */}
        <div className="right-sidebar">
          {/* Bản đồ */}
          <div className="card map-card">
             <h4>Bản đồ Tuyến đường</h4>
             {/* Bạn có thể thay thế bằng component bản đồ thật hoặc ảnh tĩnh */}
             <div className="map-placeholder">
                <Image 
                    src="/map-placeholder.png" // Thay bằng đường dẫn ảnh bản đồ của bạn
                    alt="Map" 
                    layout="fill"
                    objectFit="cover"
                />
             </div>
          </div>

          {/* Thông báo hệ thống */}
          <div className="card notification-card">
            <div className="card-header">
              <Bell size={18} />
              <h4>THÔNG BÁO HỆ THỐNG</h4>
            </div>
            <p>Bạn có 1 học sinh chưa được đón tại điểm dừng kế tiếp.</p>
          </div>
        </div>
      </div>
    </div>
  );
}