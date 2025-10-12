"use client";

import React from "react";
import { Bus, Users, UserCircle, Route, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import "./DashboardPage.css";

export default function DashboardPage() {
  const stats = [
    {
      title: "Tổng số xe buýt",
      value: "24",
      change: "+2 xe mới",
      icon: Bus,
      color: "stat-blue",
      textColor: "text-blue"
    },
    {
      title: "Tài xế hoạt động",
      value: "18/24",
      change: "6 đang nghỉ",
      icon: UserCircle,
      color: "stat-green",
      textColor: "text-green"
    },
    {
      title: "Học sinh",
      value: "456",
      change: "+12 học sinh mới",
      icon: Users,
      color: "stat-purple",
      textColor: "text-purple"
    },
    {
      title: "Tuyến đường",
      value: "8",
      change: "Đang hoạt động",
      icon: Route,
      color: "stat-orange",
      textColor: "text-orange"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "success",
      message: "Xe BUS-01 đã hoàn thành lộ trình buổi sáng",
      time: "8:30 AM",
      icon: CheckCircle
    },
    {
      id: 2,
      type: "warning",
      message: "Xe BUS-05 đang chạy chậm 5 phút so với lịch",
      time: "8:15 AM",
      icon: Clock
    },
    {
      id: 3,
      type: "alert",
      message: "Tài xế Nguyễn Văn A báo cáo sự cố nhỏ trên tuyến 3",
      time: "7:45 AM",
      icon: AlertTriangle
    },
    {
      id: 4,
      type: "success",
      message: "15 học sinh mới được thêm vào hệ thống",
      time: "7:30 AM",
      icon: Users
    }
  ];

  const busStatus = [
    { status: "Đang chạy", count: 12, color: "status-green" },
    { status: "Đang chờ", count: 6, color: "status-yellow" },
    { status: "Bảo trì", count: 4, color: "status-red" },
    { status: "Sẵn sàng", count: 2, color: "status-blue" }
  ];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tổng quan hệ thống</h1>
          <p className="page-subtitle">Chào mừng bạn đến với bảng điều khiển quản lý xe đưa đón học sinh</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon-wrapper ${stat.color}`}>
                <stat.icon className="stat-icon" />
              </div>
              <TrendingUp className="trending-icon" />
            </div>
            <h3 className="stat-label">{stat.title}</h3>
            <p className="stat-value">{stat.value}</p>
            <p className={`stat-change ${stat.textColor}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="content-grid">
        {/* Recent Activities */}
        <div className="activities-section">
          <h2 className="section-title">Hoạt động gần đây</h2>
          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon-wrapper ${activity.type}`}>
                  <activity.icon className="activity-icon" />
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <p className="activity-time">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bus Status */}
        <div className="bus-status-section">
          <h2 className="section-title">Trạng thái xe buýt</h2>
          <div className="bus-status-list">
            {busStatus.map((item, index) => (
              <div key={index} className="bus-status-item">
                <div className="status-info">
                  <span className="status-label">{item.status}</span>
                  <span className="status-count">{item.count}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${item.color}`}
                    style={{ width: `${(item.count / 24) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="bus-total">
              <p className="total-text">Tổng cộng: <span className="total-count">24 xe</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Thao tác nhanh</h2>
        <div className="actions-grid">
          <button className="action-card action-blue">
            <Bus className="action-icon" />
            <span className="action-text">Thêm xe mới</span>
          </button>
          <button className="action-card action-green">
            <UserCircle className="action-icon" />
            <span className="action-text">Thêm tài xế</span>
          </button>
          <button className="action-card action-purple">
            <Users className="action-icon" />
            <span className="action-text">Thêm học sinh</span>
          </button>
          <button className="action-card action-orange">
            <Route className="action-icon" />
            <span className="action-text">Tạo tuyến mới</span>
          </button>
        </div>
      </div>
    </div>
  );
}