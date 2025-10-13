"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/AdminDashboard/Dashboard", label: "Tổng quan", icon: "📊" },
    { href: "/AdminDashboard/Buses", label: "Xe buýt", icon: "🚌" },
    { href: "/AdminDashboard/Drivers", label: "Tài xế", icon: "👨‍✈️" },
    { href: "/AdminDashboard/Students", label: "Học sinh", icon: "🎒" },
    { href: "/AdminDashboard/Routes", label: "Tuyến đường", icon: "🗺️" },
    { href: "/AdminDashboard/Parents", label: "Phụ huynh", icon: "👨‍👩‍👧‍👦" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-yellow-300 mb-2">SSB 1.0</h1>
          <p className="text-gray-400 text-sm">Trường DEF</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-800 text-yellow-300 border-r-4 border-yellow-300"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 w-64 p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">A</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Quản trị viên</p>
              <p className="text-xs text-gray-400">admin@school.edu.vn</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  );
}