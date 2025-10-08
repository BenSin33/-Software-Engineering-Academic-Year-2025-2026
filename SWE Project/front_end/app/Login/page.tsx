"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "driver", password: "driver123", role: "driver" },
  { username: "parent", password: "parent123", role: "parent" },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      if (user.role === "admin") router.push("/AdminDashboard");
      else if (user.role === "driver") router.push("/DriverDashboard");
      else if (user.role === "parent") router.push("/ParentDashboard");
    } else {
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-screen overflow-hidden">
      {/* Background image mờ */}
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

      {/* Form login chính giữa */}
      <div className="w-80 bg-white rounded-2xl shadow-lg p-6 space-y-6">
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

        {/* Danh sách tài khoản demo */}
        <div className="text-sm text-gray-600">
          <p className="font-semibold mb-2">🧪 Tài khoản demo:</p>
          <ul className="space-y-1">
            <li>👑 <strong>Admin</strong>: admin / admin123</li>
            <li>🚌 <strong>Driver</strong>: driver / driver123</li>
            <li>👨‍👩‍👧 <strong>Parent</strong>: parent / parent123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}