// app/ParentDashboard/layout.tsx

'use client';

import { Layout } from '../../components/Layouts/Layout';
import { HiUserCircle, HiBell, HiChat, HiLocationMarker } from 'react-icons/hi';

export default function ParentDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = {
    name: 'Parent', // Có thể lấy từ localStorage hoặc context
  };

  const navItems = [
    {
      text: 'Dashboard',
      url: '/ParentDashboard',
      icon: HiUserCircle,
      children: [
        {
          text: 'Overview',
          url: '/ParentDashboard/Overview',
        },
        {
          text: 'Children Info',
          url: '/ParentDashboard/ChildrenInfo',
        },
      ],
    },
    {
      text: 'Tracking',
      url: '/ParentDashboard/Tracking',
      icon: HiChat, // Icon tin nhắn
    },
    {
      text: 'Notifications',
      url: '/ParentDashboard/Notifications',
      icon: HiBell,
    },
  ];

  return (
    <Layout list={navItems} user={user}>
      {children}
    </Layout>
  );
}