// components/MessageBadge.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { fetchMessages } from '@/app/API/messageService';

interface MessageBadgeProps {
  userId: number;
  adminId?: number;
}

export default function MessageBadge({ userId, adminId = 1 }: MessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkUnreadMessages = async () => {
      try {
        const messages = await fetchMessages(userId, adminId);
        
        // Lấy timestamp của lần xem tin nhắn cuối cùng từ localStorage
        const lastViewedKey = `lastViewed_${userId}_${adminId}`;
        const lastViewed = localStorage.getItem(lastViewedKey);
        const lastViewedTime = lastViewed ? new Date(lastViewed) : new Date(0);
        
        // Đếm số tin nhắn mới hơn lastViewedTime
        const unread = messages.filter(msg => 
          new Date(msg.createdAt) > lastViewedTime && msg.senderId !== userId
        ).length;
        
        setUnreadCount(unread);
      } catch (error) {
        console.error('Lỗi khi kiểm tra tin nhắn chưa đọc:', error);
      }
    };

    checkUnreadMessages();
    
    // Kiểm tra mỗi 10 giây
    const interval = setInterval(checkUnreadMessages, 10000);
    return () => clearInterval(interval);
  }, [userId, adminId]);

  if (unreadCount === 0) return null;

  return (
    <span style={{
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: '#ef4444',
      color: 'white',
      borderRadius: '12px',
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: 'bold',
      minWidth: '20px',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      zIndex: 10,
    }}>
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}

// Helper function để đánh dấu đã xem tin nhắn
export function markMessagesAsRead(userId: number, adminId: number = 1) {
  const lastViewedKey = `lastViewed_${userId}_${adminId}`;
  localStorage.setItem(lastViewedKey, new Date().toISOString());
}