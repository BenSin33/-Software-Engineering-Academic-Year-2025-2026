"use client";

import React, { useState, useEffect } from "react";
import { 
  Bus, 
  Users, 
  UserCheck, 
  Siren, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Plus,
  UserPlus,
  Route
} from "lucide-react";
import "./DashboardPage.css"; 
interface BusStats {
  total: number;
  running: number;
  waiting: number;
  maintenance: number;
  ready: number;
  totalCapacity: number;
  registered: number;
  avgFuelLevel: number;
  lowFuel: number;
  highMileage: number;
}
interface LocationAlert {
  id: number;
  bus_id: string;
  alert_type: "speeding" | "route_deviation" | "geofence_entry" | "geofence_exit" | "stopped_too_long";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  created_at: string;
  is_resolved: boolean;
}

interface Student {
  StudentID: number;
}
interface Driver {
  DriverID: number;
}
const BUS_SERVICE_URL = "http://localhost:3002/api";
const LOCATION_SERVICE_URL = "http://localhost:5005";
const STUDENT_SERVICE_URL = "http://localhost:5000";
const DRIVER_SERVICE_URL = "http://localhost:5001/api"; 


export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [busStats, setBusStats] = useState<BusStats | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [driverCount, setDriverCount] = useState(0);
  const [alerts, setAlerts] = useState<LocationAlert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const results = await Promise.allSettled([
        fetch(`${BUS_SERVICE_URL}/buses/stats/summary`), // 1. Lấy thống kê xe
        fetch(`${STUDENT_SERVICE_URL}/Students`),         // 2. Lấy số học sinh
        fetch(`${LOCATION_SERVICE_URL}/locations/alerts?is_resolved=false&limit=5`), // 3. Lấy cảnh báo
        fetch(`${DRIVER_SERVICE_URL}/drivers`)          // 4. Lấy số tài xế
      ]);

      // Xử lý kết quả
      if (results[0].status === 'fulfilled') {
        const data = await results[0].value.json();
        if (data.success) {
          setBusStats(data.data);
        }
      } else {
        console.error("Lỗi tải thống kê xe:", results[0].reason);
      }

      if (results[1].status === 'fulfilled') {
        const data = await results[1].value.json();
        // Giả định API trả về một mảng
        if (Array.isArray(data)) { 
          setStudentCount(data.length);
        } else if (data && typeof data.total === 'number') {
          // Hoặc nếu API trả về object { total: ... }
          setStudentCount(data.total);
        }
      } else {
        console.error("Lỗi tải danh sách học sinh:", results[1].reason);
      }

      if (results[2].status === 'fulfilled') {
        const data = await results[2].value.json();
         // Giả định API trả về mảng trong { data: [...] }
        if (data.success && Array.isArray(data.data)) {
          setAlerts(data.data);
        } else if (Array.isArray(data)) {
           // Hoặc trả về mảng trực tiếp
          setAlerts(data);
        }
      } else {
        console.error("Lỗi tải cảnh báo:", results[2].reason);
      }

       if (results[3].status === 'fulfilled') {
        const data = await results[3].value.json();
        if (Array.isArray(data)) { 
          setDriverCount(data.length);
        }
      } else {
        console.error("Lỗi tải danh sách tài xế:", results[3].reason);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // --- Hàm tiện ích ---

  // Lấy % cho thanh progress bar
  const getBusStatusPercentage = (statusCount: number): number => {
    if (!busStats || busStats.total === 0) return 0;
    return (statusCount / busStats.total) * 100;
  };

  // Định dạng thời gian (ví dụ: "10 phút trước")
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return Math.floor(seconds) + " giây trước";
  };

  // Lấy icon và class cho cảnh báo
  const getActivityIcon = (severity: LocationAlert['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return { 
          Icon: Siren, 
          className: "alert" //
        };
      case 'medium':
        return { 
          Icon: AlertTriangle, 
          className: "warning" //
        };
      case 'low':
      default:
        return { 
          Icon: CheckCircle, 
          className: "success" //
        };
    }
  };

  if (loading) {
    return <div className="dashboard-page">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Chào mừng trở lại, Admin!</h1>
        <p className="page-subtitle">Đây là tổng quan nhanh về hệ thống của bạn hôm nay.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper stat-blue">
              <Bus className="stat-icon" />
            </div>
            {/* <TrendingUp className="trending-icon" /> */}
          </div>
          <p className="stat-label">Tổng số xe</p>
          <p className="stat-value">{busStats?.total || 0}</p>
          <p className="stat-change text-blue">
            {busStats?.running || 0} xe đang chạy
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper stat-green">
              <Users className="stat-icon" />
            </div>
          </div>
          <p className="stat-label">Tổng số học sinh</p>
          <p className="stat-value">{studentCount}</p>
          <p className="stat-change text-green">
            Đã đăng ký
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper stat-purple">
              <UserCheck className="stat-icon" />
            </div>
          </div>
          <p className="stat-label">Tổng số tài xế</p>
          <p className="stat-value">{driverCount}</p>
           <p className="stat-change text-purple">
            Sẵn sàng
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper stat-orange">
              <Siren className="stat-icon" />
            </div>
          </div>
          <p className="stat-label">Cảnh báo (Chưa xử lý)</p>
          <p className="stat-value">{alerts.length}</p>
          <p className="stat-change text-orange">
            Cần chú ý ngay
          </p>
        </div>
      </div>

      {/* Content Grid (2 cột) */}
      <div className="content-grid">
        {/* Cột trái: Hoạt động gần đây */}
        <div className="activities-section">
          <h2 className="section-title">Cảnh báo & Hoạt động gần đây</h2>
          <div className="activities-list">
            {alerts.length > 0 ? (
              alerts.map((alert) => {
                const { Icon, className } = getActivityIcon(alert.severity);
                return (
                  <div key={alert.id} className="activity-item">
                    <div className={`activity-icon-wrapper ${className}`}>
                      <Icon className="activity-icon" />
                    </div>
                    <div className="activity-content">
                      <p className="activity-message">
                        <strong>[{alert.bus_id}]</strong> {alert.message}
                      </p>
                      <p className="activity-time">
                        {formatTimeAgo(alert.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="activity-time">Không có cảnh báo nào chưa xử lý.</p>
            )}
          </div>
        </div>

        {/* Cột phải: Trạng thái xe */}
        <div className="bus-status-section">
          <h2 className="section-title">Trạng thái đội xe</h2>
          <div className="bus-status-list">
            {busStats && (
              <>
                <div className="bus-status-item">
                  <div className="status-info">
                    <span className="status-label">Đang chạy</span>
                    <span className="status-count">{busStats.running}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill status-green"
                      style={{ width: `${getBusStatusPercentage(busStats.running)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bus-status-item">
                  <div className="status-info">
                    <span className="status-label">Đang chờ</span>
                    <span className="status-count">{busStats.waiting}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill status-yellow"
                      style={{ width: `${getBusStatusPercentage(busStats.waiting)}%` }}
                    ></div>
                  </div>
                </div>
                 
                 <div className="bus-status-item">
                  <div className="status-info">
                    <span className="status-label">Sẵn sàng</span>
                    <span className="status-count">{busStats.ready}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill status-blue"
                      style={{ width: `${getBusStatusPercentage(busStats.ready)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bus-status-item">
                  <div className="status-info">
                    <span className="status-label">Bảo trì</span>
                    <span className="status-count">{busStats.maintenance}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill status-red"
                      style={{ width: `${getBusStatusPercentage(busStats.maintenance)}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bus-total">
            <span className="total-text">
              Tổng cộng: <span className="total-count">{busStats?.total || 0} xe</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
         <h2 className="section-title">Truy cập nhanh</h2>
        <div className="actions-grid">
          <a href="/AdminDashboard/Buses" className="action-card action-blue">
            <Bus className="action-icon" />
            <span className="action-text">Quản lý Xe</span>
          </a>
          <a href="/AdminDashboard/Students" className="action-card action-green">
            <UserPlus className="action-icon" />
            <span className="action-text">Thêm Học sinh</span>
          </a>
           <a href="/AdminDashboard/Drivers" className="action-card action-purple">
            <UserCheck className="action-icon" />
            <span className="action-text">Quản lý Tài xế</span>
          </a>
          <a href="/AdminDashboard/Routes" className="action-card action-orange">
            <Route className="action-icon" />
            <span className="action-text">Quản lý Tuyến</span>
          </a>
        </div>
      </div>
    </div>
  );
}