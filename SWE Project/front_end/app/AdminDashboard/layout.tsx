// app/admin/layout.tsx
'use client'
import { Layout } from "@/components/Layouts/Layout"
import { adminSidebarModel } from "@/models/admin/adminSidebarModel"
const user={
    name:"Minh",
    age:30
}
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning={true} className="flex h-screen w-screen">
        <Layout suppressHydrationWarning={true} list={adminSidebarModel} user={user} children={children} />
    </div>
  )
}