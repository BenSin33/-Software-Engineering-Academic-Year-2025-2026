'use client';

import { useEffect, useState } from 'react';
import './ChildInfo.css';
import { API } from '../../API/userService';
import { studentService } from '../../API/studentService';

interface AccountDetails {
  Address: string;
  Email: string;
  FullName: string;
  ParentID: string;
  PhoneNumber: string;
  TrackingID: string;
  UserID: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: AccountDetails;
}

interface Student {
  StudentID: string;
  FullName: string;
  DateOfBirth: string;
  PickUpPoint: string;
  DropOffPoint: string;
  routeID: string;
  ParentID: string;
}

interface StudentResponse {
  message: string;
  students: Student[];
}

const getRoleName = (roleId: string) => {
  switch (roleId) {
    case 'R003':
      return 'Phụ huynh';}
}

export default function ChildInfoPage() {
  const [userInfo, setUserInfo] = useState({
    userId: '',
    roleId: '',
    token: '',
  });



  const [accountInfo, setAccountInfo] = useState<AccountDetails | null>(null);
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const roleId = localStorage.getItem('roleId');
    const token = localStorage.getItem('token');

    console.log('[DEBUG] localStorage snapshot:', { userId, token, roleId });

    if (!userId || !token) {
      setError('Thiếu thông tin đăng nhập. Vui lòng đăng nhập lại.');
      return;
    }

    setUserInfo({ userId, roleId: roleId || '', token });

    (API.getMyProfile() as Promise<ApiResponse>)
  .then((response) => {
    // Log toàn bộ object trả về từ API
    console.log('✅ [API SUCCESS] Phản hồi API đầy đủ:', response);

    // Log các key có trong response
    console.log('[DEBUG] Keys trong response:', Object.keys(response));

    // Log chi tiết phần data
    const accountData = response.data;
    console.log('[DEBUG] Nội dung accountData:', accountData);
    console.log('[DEBUG] Các field trong accountData:', Object.keys(accountData));

    // Cập nhật state
    setAccountInfo(accountData);

    // Tiếp tục gọi API lấy danh sách học sinh
    return studentService.getByParentID(accountData.ParentID) as Promise<StudentResponse>;
  })
  .then((response: StudentResponse) => {
    console.log('✅ [STUDENT API SUCCESS] Dữ liệu học sinh trả về:', response);
    console.log('[DEBUG] Keys trong StudentResponse:', Object.keys(response));
    console.log('[DEBUG] Danh sách học sinh:', response.students);

    // Nếu muốn log từng học sinh
    response.students.forEach((s, idx) => {
      console.log(`[DEBUG] Học sinh #${idx + 1}:`, s);
    });

    setStudentList(response.students);
  })
  .catch((err) => {
    console.error('❌ [API ERROR] Lỗi khi lấy thông tin:', err.response?.data || err.message || err);
    console.error('[DEBUG] Toàn bộ err object:', err);
    setError('Không thể lấy thông tin tài khoản hoặc học sinh');
  });

  }, []);

  return (
    <div className="container">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Thông tin học sinh */}
        <div className="card">
          <h1 className="title">Thông tin học sinh</h1>
          {studentList.length === 0 ? (
            <p>Không có học sinh nào được liên kết với tài khoản này.</p>
          ) : (
            <ul className="list">
              {studentList.map((student) => (
                <li key={student.StudentID} className="listItem">
                  <strong>Họ tên:</strong> {student.FullName}<br />
                  <strong>Ngày sinh:</strong> {new Date(student.DateOfBirth).toLocaleDateString('vi-VN')}<br />
                  <strong>Điểm đón:</strong> {student.PickUpPoint}<br />
                  <strong>Điểm trả:</strong> {student.DropOffPoint}<br />
                  <strong>Tuyến:</strong> {student.routeID}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Thông tin người đăng nhập */}
        <div className="card">
          <h2 className="subtitle">Thông tin chủ tài khoản</h2>
          {error && <p className="text-red-500">{error}</p>}
          {!accountInfo ? (
            <p>Đang tải...</p>
          ) : (
            <ul className="list">
              <li className="listItem"><strong>Họ tên:</strong> {accountInfo.FullName || 'Không có'}</li>
              <li className="listItem"><strong>Email:</strong> {accountInfo.Email || 'Không có'}</li>
              <li className="listItem"><strong>Số điện thoại:</strong> {accountInfo.PhoneNumber || 'Không có'}</li>
              <li className="listItem"><strong>Vai trò:</strong> {getRoleName(userInfo.roleId)}</li>
              <li className="listItem"><strong>User ID:</strong> {userInfo.userId}</li>
              <li className="listItem"><strong>Địa Chỉ:</strong> {accountInfo.Address}</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}