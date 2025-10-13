'use client';

export default function ChildInfoPage() {
  const child = {
    name: 'Nguyễn Văn An',
    age: 8,
    gender: 'Nam',
    class: 'Lớp 3A',
    school: 'Trường Tiểu học Bình Minh',
    parentContact: '0909 123 456',
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-[#FFAC50]">Thông tin học sinh</h1>
      <ul className="space-y-2 text-gray-700">
        <li><strong>Họ và tên:</strong> {child.name}</li>
        <li><strong>Tuổi:</strong> {child.age}</li>
        <li><strong>Giới tính:</strong> {child.gender}</li>
        <li><strong>Lớp:</strong> {child.class}</li>
        <li><strong>Trường:</strong> {child.school}</li>
        <li><strong>Liên hệ phụ huynh:</strong> {child.parentContact}</li>
      </ul>
    </div>
  );
}