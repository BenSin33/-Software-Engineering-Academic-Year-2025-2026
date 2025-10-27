"use client";

import React from "react";
import { Bus, ShieldCheck, MapPin, Smartphone, Users } from "lucide-react";
import "./globals.css";
import { useRouter } from "next/navigation";

export default function SmartSchoolBusPage() {

  const router = useRouter();

  return (
    <div className="smart-bus-page">
      {/* Hero Section */}
      <header className="hero-section">
        <h1 className="hero-title">Smart School Bus</h1>
        <p className="hero-subtitle">
          Giải pháp đưa đón học sinh an toàn, thông minh và hiệu quả
        </p>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Tính năng nổi bật</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Bus className="feature-icon" />
            <h3 className="feature-title">Quản lý xe buýt</h3>
            <p className="feature-desc">
              Theo dõi trạng thái, vị trí và lịch trình của từng xe buýt theo thời gian thực.
            </p>
          </div>
          <div className="feature-card">
            <ShieldCheck className="feature-icon" />
            <h3 className="feature-title">An toàn học sinh</h3>
            <p className="feature-desc">
              Cảnh báo tự động khi có sự cố, giám sát hành trình và điểm danh học sinh.
            </p>
          </div>
          <div className="feature-card">
            <MapPin className="feature-icon" />
            <h3 className="feature-title">Định vị GPS</h3>
            <p className="feature-desc">
              Cập nhật vị trí xe buýt liên tục, giúp phụ huynh và nhà trường dễ dàng theo dõi.
            </p>
          </div>
          <div className="feature-card">
            <Smartphone className="feature-icon" />
            <h3 className="feature-title">Ứng dụng di động</h3>
            <p className="feature-desc">
              Phụ huynh và tài xế sử dụng app để nhận thông báo, lịch trình và thông tin học sinh.
            </p>
          </div>
          <div className="feature-card">
            <Users className="feature-icon" />
            <h3 className="feature-title">Quản lý học sinh</h3>
            <p className="feature-desc">
              Lưu trữ thông tin, theo dõi điểm danh và phân tuyến đưa đón cho từng học sinh.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <h2 className="section-title">Về hệ thống</h2>
        <p className="about-text">
          Smart School Bus là nền tảng công nghệ giúp nhà trường và phụ huynh quản lý việc đưa đón học sinh một cách thông minh. Hệ thống tích hợp GPS, cảnh báo an toàn, quản lý tài xế và học sinh, đồng thời cung cấp ứng dụng di động tiện lợi cho mọi người tham gia.
        </p>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2 className="cta-title">Sẵn sàng nâng cấp việc đưa đón học sinh?</h2>
        <button className="cta-button" onClick={() => router.push("/Login")}>
          Đăng nhập
        </button>

      </section>
    </div>
  );
}