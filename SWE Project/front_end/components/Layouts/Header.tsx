'use client'
import { HiUserCircle, HiChat, HiBell, HiOutlineLogout } from 'react-icons/hi'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  user: any
  toggleSidebar?: () => void
}

export function Header({ user, toggleSidebar }: HeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/Login')
  }

  return (
    <header className="flex items-center justify-between h-full px-4 bg-white shadow-md">
      {/* Nút 3 gạch */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md bg-yellow-400 text-white"
      >
        <div className="space-y-1">
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </div>
      </button>

      {/* Logo */}
      <p className="font-extrabold text-[1.7rem] ml-4">
        SSB <span style={{ color: '#FFAC50' }}>1.0</span>
      </p>

      {/* Thông tin người dùng */}
      {user && (
        <div className="flex items-center gap-3 pr-3">
          <HiBell size={25} className="text-[#FFAC50]" />
          <HiChat size={25} className="text-[#FFAC50]" />
          <HiUserCircle className="text-[#FFAC50]" size={40} />
          <p>{user.name}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[#FFAC50] hover:text-orange-600 transition"
          >
            <HiOutlineLogout size={25} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      )}
    </header>
  )
}