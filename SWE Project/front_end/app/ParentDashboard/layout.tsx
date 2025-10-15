'use client';

import { Layout } from '../../components/Layouts/Layout';
import { HiUserCircle, HiBell, HiChat } from 'react-icons/hi';

export default function ParentDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = {
    name: 'Admin',
  };

  const navItems = [
    {
      text: 'Dashboard',
      url: '/parents',
      icon: HiUserCircle,
      subModules: [
        { text: 'Overview', url: '/ParentDashboard', icon: HiUserCircle },
        { text: 'Children Info', url: '/ParentDashboard/ChildInfo', icon: HiUserCircle },
      ],
    },
    {
      text: 'Tracking',
      url: '/ParentDashboard/Tracking',
      icon: HiChat,
    },
    {
      text: 'Notifications',
      url: '/ParentDashboard/Notifications',
      icon: HiBell,
    },
  ];

  return (
    <Layout list={navItems} user={user} >
      {children}
    </Layout>
  );
}