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

interface Student {
  StudentID: number;
}

interface Driver {
  DriverID: number;
}

interface BusData {
  BusID: string;
  PlateNumber: string;
  RouteID: string | null;
  Status: string;
}

interface RouteData {
  RouteID: number;
  RouteName: string;
}

// All API calls should go through the API Gateway
const API_GATEWAY_URL = "http://localhost:5000";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [busStats, setBusStats] = useState<BusStats | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [driverCount, setDriverCount] = useState(0);
  const [runningBuses, setRunningBuses] = useState<BusData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const results = await Promise.allSettled([
        fetch(`${API_GATEWAY_URL}/api/buses/stats`),
        fetch(`${API_GATEWAY_URL}/api/students/`),
        fetch(`${API_GATEWAY_URL}/api/drivers/stats`),
        fetch(`${API_GATEWAY_URL}/api/buses?status=running`),
        fetch(`${API_GATEWAY_URL}/routes`)
      ]);

      // Xử lý kết quả bus stats
      if (results[0].status === 'fulfilled') {
        const data = await results[0].value.json();
        if (data.success) {
          setBusStats(data.data);
        }
      } else {
        console.error("Lỗi tải thống kê xe:", results[0].reason);
      }

      // Xử lý kết quả student count
      if (results[1].status === 'fulfilled') {
        const data = await results[1].value.json();
        if (Array.isArray(data)) {
          setStudentCount(data.length);
        } else if (data && typeof data.total === 'number') {
          setStudentCount(data.total);
        }
      } else {
        console.error("Lỗi tải danh sách học sinh:", results[1].reason);
      }

      // Xử lý kết quả driver stats
      if (results[2].status === "fulfilled") {
        const statsData = await results[2].value.json();
        if (statsData.success && typeof statsData.data.total === "number") {
          setDriverCount(statsData.data.total);
        }
      } else {
        console.error("Lỗi tải thống kê tài xế:", results[2].reason);
      }

      // Xử lý kết quả running buses
      if (results[3].status === 'fulfilled') {
        const data = await results[3].value.json();
        if (data.success && Array.isArray(data.data)) {
          setRunningBuses(data.data);
        }
      } else {
        console.error("Lỗi tải danh sách xe đang chạy:", results[3].reason);
      }

      // Xử lý kết quả routes
      if (results[4].status === 'fulfilled') {
        const data = await results[4].value.json();
        if (Array.isArray(data)) {
          setRoutes(data);
        }
      } else {
        console.error("Lỗi tải danh sách tuyến đường:", results[4].reason);
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

  const getRouteName = (routeId: string | null) => {
    if (!routeId) return "Chưa phân tuyến";
    const route = routes.find(r => r.RouteID.toString() === routeId.toString());
    return route ? route.RouteName : routeId;
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
          <p className="stat-label">Thông báo hệ thống</p>
          <p className="stat-value">0</p>
          <p className="stat-change text-orange">
            Không có cảnh báo
          </p>
        </div>
      </div>

      {/* Content Grid (2 cột) */}
      <div className="content-grid">
        {/* Cột trái: Hoạt động gần đây */}
        <div className="activities-section">
          <h2 className="section-title">Hoạt động gần đây</h2>
          <div className="activities-list">
            {runningBuses.length > 0 ? (
              <div className="running-buses-list">
                {runningBuses.map((bus) => (
                  <div key={bus.BusID} className="activity-item">
                    <div className="activity-icon-wrapper">
                      <Bus className="activity-icon" size={20} />
                    </div>
                    <div className="activity-content">
                      <p className="activity-title">Xe {bus.PlateNumber}</p>
                      <p className="activity-desc">
                        Đang chạy trên tuyến: <strong>{getRouteName(bus.RouteID)}</strong>
                      </p>
                    </div>
                    <div className="activity-status">
                      <span className="status-badge status-green">Đang chạy</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="activity-time">Không có xe nào đang hoạt động.</p>
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