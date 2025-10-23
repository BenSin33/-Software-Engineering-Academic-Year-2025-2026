
import { Layout } from "@/components/Layouts/Layout"; 
import { driverNavList } from "@/configs/driver-nav"; 

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const driverUser = {
    name: "Anh Tài xế",
    role: "Driver",
  };

  return (
    // Gọi component Layout chung của bạn và truyền vào các props cần thiết
    <Layout list={driverNavList} user={driverUser}>
      {/* Đây là nơi Next.js sẽ tự động chèn nội dung 
        của các file page.tsx (ví dụ: app/driver/dashboard/page.tsx) vào
      */}
      {children}
    </Layout>
  );
}