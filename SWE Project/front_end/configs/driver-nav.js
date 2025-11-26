// File: configs/driver-nav.js
import { LayoutDashboard, Calendar, Users, MapPin, Bell, AlertTriangle } from 'lucide-react';

export const driverNavList = [
  {
    icon: 'LayoutDashboard',
    text: 'Overview',
    link: '/DriverDashboard'
  },
  {
    icon: 'Calendar',
    text: 'Schedule',
    link: '/DriverDashboard/Schedule'
  },
  {
    icon: 'Users',
    text: 'My Students',
    link: '/DriverDashboard/Students'
  },
  {
    icon: 'MapPin',
    text: 'Tracking',
    link: '/DriverDashboard/Tracking'
  },
  {
    // 👇 SỬA LẠI MỤC NÀY
    icon: 'AlertTriangle', 
    text: 'Alerts',        
    link: '/DriverDashboard/Alerts' 
  },
  {
    icon: 'Calendar', 
    text: 'Schedule',
    link: '/DriverDashboard/Schedule' 
  },
  {
    icon: 'LayoutDashboard', 
    text: 'Overview',
    link: '/DriverDashboard/Overview' 
  },
  {
    icon: 'Users', 
    text: 'My Students',
    link: '/DriverDashboard/MyStudents' 
  }
];