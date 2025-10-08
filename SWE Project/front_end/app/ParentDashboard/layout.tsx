"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/parents" },
    { name: "Tracking", href: "/parents/tracking" },
    { name: "Notifications", href: "/parents/notifications" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col p-5">
        <h2 className="text-2xl font-bold mb-8 text-center">Parent Dashboard</h2>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-md transition ${
                pathname === item.href ? "bg-blue-500" : "hover:bg-blue-600"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
