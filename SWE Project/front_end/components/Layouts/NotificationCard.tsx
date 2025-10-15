"use client";
import React from "react";

export default function NotificationCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-gray-800 font-semibold mb-4">THÔNG BÁO HỆ THỐNG</h3>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          Bạn có <span className="font-semibold">1 học sinh chưa đón</span> tại điểm dừng kế tiếp.
        </p>
      </div>
    </div>
  );
}
