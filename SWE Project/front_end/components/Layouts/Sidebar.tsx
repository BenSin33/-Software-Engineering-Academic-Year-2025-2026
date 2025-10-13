"use client";
import { Bus, Clock, MapPin, Users, ChevronRight } from "lucide-react";
import React from "react";

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export default function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  const menuItems = [
    { id: "schedule1", icon: Clock, label: "Lịch trình" },
    { id: "journey", icon: Bus, label: "Tài xế" },
    { id: "tracking", icon: MapPin, label: "Tracking" },
    { id: "users", icon: Users, label: "Users" },
  ];

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">
          <span className="text-gray-800">SSB</span>
          <span className="text-orange-500"> 1.0</span>
        </h1>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeMenu;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight
                size={16}
                className={isActive ? "text-white" : "text-gray-400"}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
