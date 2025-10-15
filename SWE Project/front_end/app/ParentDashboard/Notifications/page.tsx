"use client";

import { useState, useEffect } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const messages = [
      "Bus #12A is approaching your home 🚍",
      "Bus delayed by 5 minutes ⏱️",
      "Bus has arrived at school 🏫",
      "Minor incident reported, all safe ✅",
    ];

    let index = 0;
    const interval = setInterval(() => {
      setNotifications((prev) => [messages[index % messages.length], ...prev]);
      index++;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Notifications 🔔</h1>
      <ul className="space-y-3">
        {notifications.map((msg, i) => (
          <li
            key={i}
            className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-600"
          >
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}
