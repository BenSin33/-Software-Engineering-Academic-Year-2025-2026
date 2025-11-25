'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bus, MessageSquare } from 'lucide-react';
import MapView from '@/components/Layouts/MapView';
import MessagePanel from '@/components/Driver/MessagePanel';
import { userIdToMessageId } from '@/utils/IdConverter';
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
    { id: 2, name: 'Nguyễn Văn/Trả', status: 'Đã đón' },
    { id: 3, name: 'Điểm đón/Trả', status: 'Đã đón' },
    { id: 4, name: 'Nguyễn Văn A', status: 'Đã đón' },
    { id: 5, name: 'Druyên số 10', status: 'Đã đón' },
    { id: 6, name: 'Nguyễn Văn A', status: 'Đã đón' },
    { id: 7, name: 'Nguyễn Văn A', status: 'Đã đón' },
    { id: 8, name: 'Druyên số 10', status: 'Đã đón' },
  ];

  const [students, setStudents] = useState(initialStudents);
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [driverId, setDriverId] = useState<number | null>(null);

  // 🔧 Lấy driver ID khi component mount
  useEffect(() => {
    // CÁCH 1: Hardcode cho demo - Driver UserID "U002" → Numeric ID 2
    // Trong production, lấy từ localStorage hoặc context sau khi login
    const driverUserIdString = 'U002'; // Hoặc lấy từ localStorage.getItem('userId')
    const numericDriverId = userIdToMessageId(driverUserIdString);

    console.log(`🔧 Driver UserID: ${driverUserIdString} → Numeric Message ID: ${numericDriverId}`);
    setDriverId(numericDriverId);

    // CÁCH 2: Lấy từ localStorage (nếu đã lưu khi login)
    // const storedUserId = localStorage.getItem('userId'); // e.g., "U002"
    // if (storedUserId) {
    //   setDriverId(userIdToMessageId(storedUserId));
    // } else {
    //   setDriverId(userIdToMessageId('U002')); // fallback
    // }
  }, []);

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
          <button
            className="report-button"
            onClick={() => setShowMessagePanel(true)}
            style={{ marginRight: '12px' }}
            disabled={!driverId}
          >
            <MessageSquare size={16} />
            TIN NHẮN
          </button>
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

      {/* Message Panel Modal */}
      {showMessagePanel && driverId && (
        <div className="message-modal-overlay" onClick={() => setShowMessagePanel(false)}>
          <div className="message-modal-content" onClick={(e) => e.stopPropagation()}>
            <MessagePanel
              driverId={driverId}
              adminId={1}
              onClose={() => setShowMessagePanel(false)}
            />
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
      `}</style>
    </div>
  );
}