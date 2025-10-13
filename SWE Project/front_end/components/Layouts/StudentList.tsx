"use client";
import React from "react";

interface Student {
  id: number;
  name: string;
  status: string;
  location: string;
}

interface StudentListProps {
  students: Student[];
  toggleStudentStatus: (id: number) => void;
}

export default function StudentList({ students, toggleStudentStatus }: StudentListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-gray-800 font-semibold text-lg">DANH SÁCH HỌC SINH</h3>
      </div>

      <div className="divide-y divide-gray-100">
        <div className="px-6 py-3 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
          <span>Tên học sinh</span>
          <span>Trạng thái</span>
        </div>

        {students.map((student) => (
          <div key={student.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-gray-800 font-medium">{student.name}</p>
              <p className="text-gray-500 text-sm">{student.location}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={student.status === "picked"}
                onChange={() => toggleStudentStatus(student.id)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 rounded-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {student.status === "picked" ? "Đã đón" : "Đang đợi"}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
