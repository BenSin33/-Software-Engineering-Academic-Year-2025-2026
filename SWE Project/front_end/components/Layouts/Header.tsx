// File: components/Layouts/Header.tsx
'use client'

import { useState } from 'react'; //  1. Import useState
import { HiUserCircle, HiChat, HiBell, HiOutlineLogout } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import NotificationDropdown from './NotificationDropdown'; //  2. Import component dropdown

interface HeaderProps {
  user: any;
  toggleSidebar?: () => void;
}

export function Header({ user, toggleSidebar }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false); //  3. Tạo state để quản lý việc ẩn/hiện
  const router = useRouter();

  // Dữ liệu thông báo giả
  const notifications = [
    { id: 1, message: 'Bạn có 1 học sinh chưa được đón tại điểm dừng kế tiếp.' },
    { id: 2, message: 'Chuyến đi buổi chiều sẽ bắt đầu lúc 16:30.' },
    { id: 3, message: 'Xe BUS-05 đã được bảo dưỡng thành công.' }
  ];

  const handleLogout = () => {
    router.push('/Login');
  };

  return (
    // Thêm thẻ fragment <>...</> để bao bọc header và dropdown
    <>
      <header className="flex items-center justify-between h-full px-4 bg-white shadow-md z-20 relative">
        <div className="flex items-center">
            {/* Nút 3 gạch */}
            <button
            suppressHydrationWarning={true}
                onClick={toggleSidebar}
                className="p-2 rounded-md bg-yellow-400 text-white mr-4"
            >
                <div className="space-y-1">
                <span className="block w-6 h-0.5 bg-white"></span>
                <span className="block w-6 h-0.5 bg-white"></span>
                <span className="block w-6 h-0.5 bg-white"></span>
                </div>
            </button>

            {/* Logo */}
            <p className="font-extrabold text-[1.7rem]">
                SSB <span style={{ color: '#FFAC50' }}>1.0</span>
            </p>
        </div>

        {/* Thông tin người dùng */}
        {user && (
          <div className="flex items-center gap-3 pr-3">
            <div className="relative">
              {/*  4. Thêm onClick cho chuông thông báo */}
              <HiBell
                size={25}
                className="text-[#FFAC50] cursor-pointer"
                onClick={() => setShowNotifications(!showNotifications)}
              />
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {notifications.length}
              </span>
            </div>

            <HiChat size={25} className="text-[#FFAC50]" />
            <HiUserCircle className="text-[#FFAC50]" size={40} />
            <p>{user.name}</p>
            <button
            suppressHydrationWarning={true}
              onClick={handleLogout}
              className="flex items-center gap-1 text-[#FFAC50] hover:text-orange-600 transition"
            >
              <HiOutlineLogout size={25} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </header>

      {/*  5. Hiển thị dropdown nếu state là true */}
      {showNotifications && <NotificationDropdown notifications={notifications} />}
    </>
  );
}