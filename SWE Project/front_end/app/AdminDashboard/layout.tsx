// app/admin/layout.tsx
import { Layout } from "@/components/Layouts/Layout"
import { adminSidebarModel } from "@/models/admin/adminSidebarModel"
const user={
    name:"Minh",
    age:30
}
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar cố định */}
        <Layout list={adminSidebarModel} user={user} children={children} />
    </div>
  )
}