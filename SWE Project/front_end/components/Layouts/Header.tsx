"use client";
import { Clock, Settings, Menu, Users } from "lucide-react";
import React from "react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <Menu className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <Users size={18} className="text-orange-600" />
          </div>
          <span className="text-sm font-medium">Xin chào, Anh Tài xế!</span>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Clock size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Settings size={20} className="text-gray-600" />
        </button>
      </div>
    </header>
  );
}
