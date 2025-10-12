"use client";

import { useState, useEffect } from "react";

export default function TrackingPage() {
  const [busLocation, setBusLocation] = useState({ lat: 10.762622, lng: 106.660172 });

  // Mô phỏng vị trí xe di chuyển
  useEffect(() => {
    const interval = setInterval(() => {
      setBusLocation((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tracking Bus Location 🚌</h1>
      <div className="bg-white p-4 rounded-xl shadow">
        <p>
          <b>Latitude:</b> {busLocation.lat.toFixed(6)} <br />
          <b>Longitude:</b> {busLocation.lng.toFixed(6)}
        </p>
        <p className="mt-2 text-gray-500">(Simulated real-time data)</p>
      </div>
    </div>
  );
}
