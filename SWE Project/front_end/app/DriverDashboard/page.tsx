"use client";
import React, { useState } from "react";
import Sidebar from "../../components/Layouts/Sidebar";
import Header from "../../components/Layouts/Header";
import StudentList from "../../components/Layouts/StudentList";
import MapSection from "../../components/Layouts/MapSection";
import NotificationCard from "../../components/Layouts/NotificationCard";

export default function DriverDashboard() {
  const [students, setStudents] = useState([
    { id: 1, name: "Nguyễn Văn A", status: "pending", location: "Điểm đón" },
    { id: 2, name: "Trần Văn B", status: "picked", location: "Điểm đón" },
    { id: 3, name: "Lê Thị C", status: "pending", location: "Điểm đón" },
  ]);

  const [activeMenu, setActiveMenu] = useState("journey");

  const toggleStudentStatus = (id: number) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? { ...student, status: student.status === "picked" ? "pending" : "picked" }
          : student
      )
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6 grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <StudentList students={students} toggleStudentStatus={toggleStudentStatus} />
          </div>
          <div className="space-y-6">
            <MapSection />
            <NotificationCard />
          </div>
        </div>
      </div>
    </div>
  );
}

