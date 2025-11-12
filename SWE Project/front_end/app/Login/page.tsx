"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../API/auth"; // Hàm gọi API đăng nhập từ backend

export default function LoginPage() {
  // Khai báo state để lưu thông tin nhập từ người dùng
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter(); // Dùng để điều hướng sau khi đăng nhập

  // Hàm xử lý khi người dùng nhấn nút đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn reload trang

    try {
      // Gọi API đăng nhập
      const data = await login(username, password);
      setError(""); // Xóa lỗi nếu đăng nhập thành công
      console.log('[DEBUG] Dữ liệu đăng nhập:', data);

      //  Lưu token và thông tin người dùng vào localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userID);
      localStorage.setItem("roleId", data.roleID);

      //  Ánh xạ roleID sang tên vai trò
      const roleMap: Record<string, string> = {
        R001: "Admin",
        R002: "Driver",
        R003: "Parent",
      };

      const roleName = roleMap[data.roleID];

      //  Điều hướng đến dashboard tương ứng
      if (roleName === "Admin") router.push("/AdminDashboard");
      else if (roleName === "Parent") router.push("/ParentDashboard");
      else if (roleName === "Driver") router.push("/DriverDashboard");
      else setError("Không xác định được vai trò người dùng");
    } catch (err: any) {
      // Hiển thị lỗi nếu đăng nhập thất bại
      setError(err.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-screen overflow-hidden">
      {/* Giao diện form đăng nhập */}
      <div className="w-80 bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm border border-red-300">
            {error}
          </div>
        )}

        {/* Form đăng nhập */}
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