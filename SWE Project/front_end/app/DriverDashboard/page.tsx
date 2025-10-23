'use client';

import React, { useState } from 'react';
import { AlertTriangle, Bus } from 'lucide-react';
import MapView from '@/components/Layouts/MapView';
import './DriverJourney.css';

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
      {/* Header */}
      <div className="page-main-header">
        <div className="user-actions">
          <button className="report-button">
            <AlertTriangle size={16} />
            BÁO CÁO SỰ CỐ
          </button>
        </div>
      </div>

      {/* Nội dung chia 2 cột */}
      <div className="journey-content-grid" style={{ display: 'flex', gap: '24px' }}>
        {/* Cột trái: lịch trình và danh sách học sinh */}
        <div className="main-content" style={{ flex: 1 }}>
          <p className="page-breadcrumb">Lịch trình</p>

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
                    <span>{student.status}</span>
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

        {/* Cột phải: bản đồ */}
        <div className="map-content" style={{ flex: 1 }}>
          <div className="map-wrapper" style={{
            height: '100%',
            minHeight: '400px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
          }}>
            <MapView />
          </div>
        </div>
      </div>
    </div>
  );
}