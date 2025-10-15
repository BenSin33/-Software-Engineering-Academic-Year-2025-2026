import Link from 'next/link';
export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Smart School Bus</h1>
      <p className="text-lg text-gray-700 mb-6">Giải pháp quản lý xe buýt trường học thông minh</p>
      <Link href="/Login" className="bg-yellow-600 text-black px-6 py-2 rounded hover:text-white">
        Đăng nhập
      </Link>
    </main>
  );
}
