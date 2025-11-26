
'use client';
import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layouts/Layout';
import { API } from '../API/userService';
import { HiUserCircle, HiBell, HiChat, HiLocationMarker } from 'react-icons/hi';

interface AccountDetails {
  FullName: string;
  // các trường khác nếu cần
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: AccountDetails;
}

export default function ParentDashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string }>({ name: 'Parent' });

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await API.getMyProfile() as ApiResponse;
        setUser({ name: response.data.FullName || 'Parent' });
      } catch (error) {
        console.error('Lỗi khi lấy tên người dùng:', error);
      }
    };

    fetchUserName();
  }, []);

  const navItems = [
    { text: 'Dashboard', url: '/ParentDashboard', icon: HiUserCircle },
    { text: 'Children Info', url: '/ParentDashboard/ChildInfo', icon: HiUserCircle },
    { text: 'Messages', url: '/ParentDashboard/Message', icon: HiChat },
    { text: 'Bus Location', url: '/ParentDashboard/BusLocation', icon: HiLocationMarker },
  ];

  return (
    <Layout list={navItems} user={user}>
      {children}
    </Layout>
  );
}