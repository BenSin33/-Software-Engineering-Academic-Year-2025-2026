"use client";
import React from "react";
import { MapPin, Bus, AlertCircle } from "lucide-react";

export default function MapSection() {
  return (
    <div className="space-y-6">
      {/* Emergency Button */}
      <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2">
        <AlertCircle size={20} />
        BÁO CÁO SỰ CỐ
      </button>

      {/* Map Area */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-gray-800 font-semibold">Tuyến đường</h3>
        </div>
        <div className="relative h-80 bg-gray-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Route line */}
              <svg className="absolute inset-0 w-full h-full">
                <path
                  d="M 60 40 Q 100 80 120 160 T 140 240"
                  stroke="#FFA500"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="5,5"
                />
              </svg>

              {/* Map markers */}
              <div className="absolute top-8 left-12">
                <MapPin className="text-orange-500" size={24} fill="orange" />
              </div>
              <div className="absolute bottom-12 right-12">
                <MapPin className="text-orange-400" size={20} />
              </div>

              {/* Main Bus */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Bus className="text-white" size={28} />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded text-xs font-medium text-orange-600 shadow">
                    SSB 1.0
                  </div>
                </div>
              </div>

              {/* Pickup point */}
              <div className="absolute bottom-20 right-20">
                <MapPin className="text-yellow-500" size={28} fill="yellow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
