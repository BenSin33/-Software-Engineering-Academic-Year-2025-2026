import { Layout } from "@/components/Layouts/Layout"
import { adminSidebarModel } from "@/models/admin/adminSidebarModel" 
import { adminNavList } from "@/configs/admin-nav"; 

const user={
    name:"Minh",
    age:30
}
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen">
        <Layout list={adminSidebarModel} user={user} children={children} />
    </div>
  )
}