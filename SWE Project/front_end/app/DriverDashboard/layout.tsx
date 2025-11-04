'use client';

import { Layout } from '../../components/Layouts/Layout';
import { HiUserCircle, HiBell, HiChat, HiExclamationCircle, HiDocument, HiDocumentReport, HiMap, HiBookmark } from 'react-icons/hi';

export default function ParentDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = {
    name: 'Admin',
  };

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
      text: 'Notifications',
      url: '/DriverDashboard/Notifications',
      icon: HiBell,
    },
  ];

  return (
    <Layout list={navItems} user={user} >
      {children}
    </Layout>
  );
}