'use client';

type Notification = {
  id: number;
  message: string;
};

type NotificationDropdownProps = {
  notifications: Notification[];
};

export default function NotificationDropdown({ notifications }: NotificationDropdownProps) {
  return (
    <div className="absolute top-14 right-28 w-80 bg-white rounded-lg shadow-lg border z-50">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-gray-700">Thông Báo</h3>
      </div>
      <ul className="divide-y max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <li key={notification.id} className="p-3 hover:bg-gray-50 cursor-pointer">
              <p className="text-sm text-gray-600">{notification.message}</p>
            </li>
          ))
        ) : (
          <li className="p-3">
            <p className="text-sm text-gray-500 text-center">Không có thông báo mới.</p>
          </li>
        )}
      </ul>
      <div className="p-2 border-t text-center">
        <a href="#" className="text-sm text-blue-600 hover:underline">Xem tất cả</a>
      </div>
    </div>
  );
}