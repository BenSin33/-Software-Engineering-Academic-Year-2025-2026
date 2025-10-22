
'use client'
import Image from "next/image"
import { Search } from "lucide-react"
import { HiUserCircle } from "react-icons/hi"
import { HiChat } from "react-icons/hi"
import { HiBell } from "react-icons/hi"
import { HiOutlineLogout } from "react-icons/hi" // ✅ Thêm icon logout
import { useRouter } from "next/navigation" // ✅ Thêm router để điều hướng


export function Header({ user }: any) {
    const router = useRouter(); // ✅ Khởi tạo router

    const handleLogout = () => {
        router.push('/Login'); // ✅ Điều hướng về trang Login
    };

    return (
        <header style={{ backgroundColor: 'white' }} className="flex items-center justify-between h-full px-6">
            {/* Logo bên trái */}
            <p className="font-bold text-2xl">SSB <span style={{ color: '#FFAC50' }}>1.0</span></p>

            {/* ✅ Thanh tìm kiếm ở giữa */}
            <div className="search-bar-header">
              <Search size={20} className="search-icon" />
              <input type="text" placeholder="Search..." />
            </div>

            {/* Thông tin người dùng bên phải */}
            {(user) && <div className="flex items-center gap-4">
                <HiBell size={25} className="text-[#FFAC50] cursor-pointer" />
                <HiChat size={25} className="text-[#FFAC50] cursor-pointer" />
                <HiUserCircle className="text-[#FFAC50]" size={40} />
                <p>{user?.name || roleText}</p> 
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
                >
                    <HiOutlineLogout size={25} />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>}
        </header>
    )
}
