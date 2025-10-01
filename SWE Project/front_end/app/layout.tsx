import './globals.css';

export const metadata = {
  title: 'Smart School Bus',
  description: 'Giải pháp quản lý xe buýt trường học thông minh',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex flex-col min-h-screen bg-white text-gray-800">
        {/* Nội dung chính */}
        <main className="flex-grow bg-gray-100 flex justify-center items-center p-6">
          {children}
        </main>
      </body>
    </html>
  );
}