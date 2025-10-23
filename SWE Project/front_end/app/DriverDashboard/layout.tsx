'use client';

import { Layout } from '../../components/Layouts/Layout';
import { HiUserCircle, HiBell, HiChat, HiExclamationCircle, HiDocument, HiDocumentReport } from 'react-icons/hi';

export default function ParentDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = {
    name: 'Admin',
  };

  const navItems = [
    {
      text: 'Alert',
      url: '/DriverDashboard/Alert',
      icon: HiExclamationCircle,
    },
    {
      text: 'Pickup reports',
      url: '/DriverDashboard/Tracking',
      icon: HiDocumentReport,
    },
    {
      text: 'Notifications',
      url: '/DriverDashboard/Schedule',
      icon: HiBell,
    },
  ];

  return (
    <Layout list={navItems} user={user} >
      {children}
    </Layout>
  );
}