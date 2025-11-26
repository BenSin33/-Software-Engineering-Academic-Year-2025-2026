'use client';
import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layouts/Layout';
import { API } from '../API/userService';
import { 
  HiUserCircle, 
  HiBell, 
  HiChat, 
  HiDocument, 
  HiDocumentReport, 
  HiMap 
} from 'react-icons/hi';

interface AccountDetails {
  FullName: string;
  // các trường khác nếu cần
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: AccountDetails;
}

export default function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string }>({ name: 'Driver' });

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await API.getMyProfile() as ApiResponse;
        setUser({ name: response.data.FullName || 'Driver' });
      } catch (error) {
        console.error('Lỗi khi lấy tên tài xế:', error);
      }
    };

    fetchUserName();
  }, []);

  const navItems = [
    {
      text: 'Overview',
      url: '/DriverDashboard/Overview',
      icon: HiDocument,
    },
    {
      text: 'Schedule',
      url: '/DriverDashboard/Schedule',
      icon: HiDocumentReport,
    },
    {
      text: 'My Students',
      url: '/DriverDashboard/MyStudents',
      icon: HiUserCircle,
    },
    {
      text: 'Tracking',
      url: '/DriverDashboard/Tracking',
      icon: HiMap,
    },
    {
      text: 'Messages',
      url: '/DriverDashboard/Message',
      icon: HiChat,
    },
    {
      text: 'Notifications',
      url: '/DriverDashboard/Notifications',
      icon: HiBell,
    },
  ];

  return (
    <Layout list={navItems} user={user}>
      {children}
    </Layout>
  );
}
