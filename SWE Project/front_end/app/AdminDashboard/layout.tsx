// app/admin/layout.tsx
'use client'
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layouts/Layout";
import { adminSidebarModel } from "@/models/admin/adminSidebarModel";
import { API } from '../API/userService';

interface AccountDetails {
  FullName: string;
  // thêm các trường khác nếu cần
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: AccountDetails;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string }>({ name: "Admin" });

  useEffect(() => {
    const fetchAdminName = async () => {
      try {
        const response = await API.getMyProfile() as ApiResponse;
        setUser({ name: response.data.FullName || "Admin" });
      } catch (error) {
        console.error("Lỗi khi lấy tên admin:", error);
      }
    };

    fetchAdminName();
  }, []);

  return (
    <div suppressHydrationWarning={true} className="flex h-screen w-screen">
      <Layout
        suppressHydrationWarning={true}
        list={adminSidebarModel}
        user={user}
      >
        {children}
      </Layout>
    </div>
  );
}
