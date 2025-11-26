// app/DriverDashboard/Tracking/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Clock, AlertCircle } from 'lucide-react';
import { fetchMessages, sendMessage } from '@/app/API/messageService';
import './MessagesPage.css';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
}

export default function DriverMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [driverId, setDriverId] = useState<number | null>(null);
  const adminId = 1; // ID của Admin

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const match = storedUserId.match(/\d+/);
      if (match) {
        setDriverId(parseInt(match[0]));
      } else {
        setError('UserID không hợp lệ. Vui lòng đăng nhập lại.');
      }
    } else {
      setDriverId(5); // demo
    }
  }, []);

  useEffect(() => {
    if (driverId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [driverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!driverId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMessages(driverId, adminId);
      setMessages(data);
    } catch (err: any) {
      setError('Không thể tải tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !driverId) return;
    try {
      setSending(true);
      setError(null);
      await sendMessage({
        senderId: driverId,
        receiverId: adminId,
        content: newMessage.trim(),
      });
      setNewMessage('');
      await loadMessages();
    } catch (err: any) {
      setError(`Không thể gửi tin nhắn: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!driverId) {
    return (
      <div className="messages-page">
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Không tìm thấy thông tin tài xế</h3>
          <p>Vui lòng đăng nhập lại</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      {/* Header */}
      <div className="messages-header">
        <div className="header-content">
          <MessageSquare size={32} className="header-icon" />
          <div>
            <h1 className="header-title">Tin nhắn với Nhà trường</h1>
            <p className="header-subtitle">Liên hệ trực tiếp với ban quản lý nhà trường</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        <div className="messages-wrapper">
          {/* Chat Info Card */}
          <div className="chat-info-card">
            <div className="admin-avatar"><User size={24} /></div>
            <div>
              <h3>Ban Quản Lý Nhà Trường</h3>
              <p className="status-text"><span className="status-dot"></span>Đang hoạt động</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="messages-area">
            {loading && messages.length === 0 ? (
              <div className="loading-state"><div className="loading-spinner"></div><p>Đang tải tin nhắn...</p></div>
            ) : error && messages.length === 0 ? (
              <div className="error-state">
                <AlertCircle size={48} />
                <h3>Không thể tải tin nhắn</h3>
                <p>{error}</p>
                <button onClick={loadMessages} className="retry-button">Thử lại</button>
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-state">
                <MessageSquare size={64} />
                <h3>Chưa có tin nhắn nào</h3>
                <p>Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện với nhà trường</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isFromDriver = message.senderId === driverId;
                  const showDate = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                  return (
                    <React.Fragment key={message.id}>
                      {showDate && <div className="date-divider"><span>{formatDate(message.createdAt)}</span></div>}
                      <div className={`message-wrapper ${isFromDriver ? 'from-driver' : 'from-admin'}`}>
                        {!isFromDriver && <div className="message-avatar"><User size={20} /></div>}
                        <div className="message-bubble">
                          {!isFromDriver && <p className="message-sender">Ban Quản Lý</p>}
                          <p className="message-content">{message.content}</p>
                          <div className="message-footer"><Clock size={12} /><span className="message-time">{formatTime(message.createdAt)}</span></div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="input-area">
            {error && <div className="error-banner"><AlertCircle size={16} /><span>{error}</span></div>}
            <form onSubmit={handleSendMessage} className="input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..."
                disabled={sending}
                className="message-input"
              />
              <button type="submit" disabled={!newMessage.trim() || sending} className="send-button">
                {sending ? <div className="sending-spinner"></div> : <Send size={20} />}
              </button>
            </form>
            <p className="input-hint">Nhấn Enter để gửi tin nhắn</p>
          </div>
        </div>
      </div>
    </div>
  );
}
