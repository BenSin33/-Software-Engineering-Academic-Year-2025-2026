import '../globals.css';

export const metadata = {
  title: 'Đăng nhập - Smart School Bus',
  description: 'Trang đăng nhập hệ thống quản lý xe buýt trường học thông minh',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-white text-gray-800">
      {/* Ảnh nền mờ */}
      <div className="absolute inset-0">
        <img
          src="/SchoolBus.jpg"
          alt="School Bus"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* Lớp phủ để tăng tương phản nếu cần */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>

      {/* Nội dung login */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </section>
  );
}
