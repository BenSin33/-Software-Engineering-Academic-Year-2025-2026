"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../API/auth"; // ✅ Gọi từ thư mục API

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      setError("");
  
      const roleMap: Record<string, string> = {
        R001: "Admin",
        R002: "Driver",
        R003: "Parent",
      };
      
      const roleName = roleMap[data.roleID];
  
      if (roleName === "Admin") setTimeout (() => router.push("/AdminDashboard"), 1500);
      else if (roleName === "Parent") setTimeout(() => router.push("/ParentDashboard"), 1500);
      else if (roleName === "Driver") setTimeout(() => router.push("/DriverDashboard"),1500);
      else setError("Không xác định được vai trò người dùng");
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 relative">
        <Image
          src="/SchoolBus.jpg"
          alt="School Bus"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
      </div>

      <div className="w-80 bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <button
            type="submit"
            className="w-full bg-yellow-400 text-white font-semibold py-2 rounded-lg hover:bg-yellow-500 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}