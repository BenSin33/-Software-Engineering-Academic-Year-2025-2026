// components/Parent/MessagePanel.tsx - FIXED VERSION

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, User, Clock } from 'lucide-react';
import { fetchMessages, sendMessage } from '@/app/API/messageService';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
}

interface MessagePanelProps {
  parentId: number;      // 🔧 Người gửi (Admin = 1, Parent = userId của parent)
  receiverId: number;    // 🔧 Người nhận (Parent userId hoặc Admin ID)
  receiverName: string;  // Tên người nhận
  onClose: () => void;
}

const MessagePanel: React.FC<MessagePanelProps> = ({
  parentId,
  receiverId,
  receiverName,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [parentId, receiverId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading messages between:', { parentId, receiverId });
      
      // 🔧 Lấy tin nhắn giữa 2 người (API tự động lấy cả 2 chiều)
      const data = await fetchMessages(parentId, receiverId);
      
      console.log('✅ Messages loaded:', data);
      setMessages(data);
    } catch (err: any) {
      console.error('❌ Lỗi khi tải tin nhắn:', err);
      setError(err.message || 'Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      setError(null);
      
      console.log('📤 Sending message:', {
        senderId: parentId,
        receiverId: receiverId,
        content: newMessage.trim()
      });
      
      await sendMessage({
        senderId: parentId,
        receiverId: receiverId,
        content: newMessage.trim(),
      });
      
      setNewMessage('');
      await loadMessages();
      
      console.log('✅ Message sent successfully');
    } catch (err: any) {
      console.error('❌ Lỗi khi gửi tin nhắn:', err);
      setError(err.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        background: 'linear-gradient(135deg, #FFAC50 0%, #ff9030 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
              {receiverName}
            </h3>
            <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                background: '#4ade80',
                borderRadius: '50%',
                marginRight: '0.5rem'
              }}></span>
              Đang hoạt động
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          <X size={20} color="white" />
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
      }}>
        {loading && messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #FFAC50',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            Đang tải tin nhắn...
          </div>
        ) : error && messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#dc2626', padding: '2rem' }}>
            <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Không thể tải tin nhắn</h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem' }}>{error}</p>
            <button
              onClick={loadMessages}
              style={{
                padding: '0.5rem 1rem',
                background: '#FFAC50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Thử lại
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Chưa có tin nhắn nào</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              // 🔧 Kiểm tra xem tin nhắn từ người gửi hay người nhận
              const isFromSender = message.senderId === parentId;
              
              // Hiển thị date divider
              const showDateDivider = index === 0 || 
                formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
              
              return (
                <React.Fragment key={message.id}>
                  {showDateDivider && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      margin: '1.5rem 0'
                    }}>
                      <span style={{
                        background: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}
                  
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: isFromSender ? 'flex-end' : 'flex-start',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '0.875rem 1.125rem',
                      borderRadius: isFromSender ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: isFromSender ? '#FFAC50' : 'white',
                      color: isFromSender ? 'white' : '#1f2937',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        {message.content}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        fontSize: '0.7rem',
                        opacity: 0.7,
                        justifyContent: isFromSender ? 'flex-end' : 'flex-start'
                      }}>
                        <Clock size={12} />
                        <span>{formatTime(message.createdAt)}</span>
                      </div>
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
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
      }}>
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn của bạn..."
            disabled={sending}
            style={{
              flex: 1,
              padding: '0.875rem 1.125rem',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#FFAC50';
              e.target.style.boxShadow = '0 0 0 3px rgba(255, 172, 80, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              padding: '0.875rem 1.5rem',
              background: (!newMessage.trim() || sending) ? '#d1d5db' : 'linear-gradient(135deg, #FFAC50 0%, #ff9030 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: (!newMessage.trim() || sending) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              minWidth: '100px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!newMessage.trim() || sending) return;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 172, 80, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {sending ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Đang gửi...
              </>
            ) : (
              <>
                <Send size={18} />
                Gửi
              </>
            )}
          </button>
        </form>
        
        <p style={{
          margin: '0.5rem 0 0 0',
          fontSize: '0.75rem',
          color: '#9ca3af',
          textAlign: 'center'
        }}>
          Nhấn Enter để gửi tin nhắn
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MessagePanel;