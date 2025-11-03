// app/ParentDashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Bus, Clock, MapPin, Bell, Users, Phone, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { getParentByUserId, Parent } from '@/app/API/parentService';

export default function ParentDashboardPage() {
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParentData();
  }, []);

  const loadParentData = async () => {
    try {
      const storedUserId = localStorage.getItem('userId');
      const userId = storedUserId || 'U004'; // Demo
      
      const data = await getParentByUserId(userId);
      setParent(data);
    } catch (err) {
      console.error('Error loading parent:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentTime = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{ backgroundColor: '#EEEEEE', minHeight: '100vh', padding: '2rem' }}>
      {/* Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FFAC50 0%, #ff9030 100%)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white',
        boxShadow: '0 4px 20px rgba(255, 172, 80, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0'
            }}>
              Xin chào, {loading ? '...' : parent?.FullName || 'Phụ huynh'} 👋
            </h1>
            <p style={{ margin: 0, opacity: 0.95, fontSize: '1rem' }}>
              {currentDate}
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px'
          }}>
            <Clock size={24} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {currentTime}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Bus Status */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bus size={24} style={{ color: 'white' }} />
            </div>
            <span style={{
              padding: '0.375rem 0.75rem',
              background: '#dbeafe',
              color: '#1e40af',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              Đang di chuyển
            </span>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
            Trạng thái xe buýt
          </h3>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>
            Xe buýt #12A đang trên đường đến trường
          </p>
        </div>

        {/* Next Stop */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={24} style={{ color: 'white' }} />
            </div>
            <span style={{
              padding: '0.375rem 0.75rem',
              background: '#d1fae5',
              color: '#065f46',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              3 phút nữa
            </span>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
            Điểm dừng tiếp theo
          </h3>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>
            Sắp đến nhà bạn
          </p>
        </div>

        {/* Students */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #FFAC50 0%, #ff9030 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} style={{ color: 'white' }} />
            </div>
            <span style={{
              padding: '0.375rem 0.75rem',
              background: '#fff7ed',
              color: '#c2410c',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              2 học sinh
            </span>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
            Học sinh của bạn
          </h3>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>
            Tất cả đang an toàn
          </p>
        </div>
      </div>

      {/* Recent Activity & Notifications */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Recent Activity */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <TrendingUp size={24} style={{ color: '#FFAC50' }} />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Hoạt động gần đây
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { time: '07:45', text: 'Xe buýt đã đón học sinh tại điểm A', icon: CheckCircle, color: '#10b981' },
              { time: '07:30', text: 'Xe buýt khởi hành từ bến', icon: Bus, color: '#3b82f6' },
              { time: '07:15', text: 'Tài xế đã check-in', icon: CheckCircle, color: '#10b981' },
              { time: '07:00', text: 'Lộ trình hôm nay đã được xác nhận', icon: MapPin, color: '#FFAC50' }
            ].map((activity, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #f3f4f6',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
              >
                <div style={{
                  padding: '0.5rem',
                  background: 'white',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <activity.icon size={20} style={{ color: activity.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#1f2937',
                    margin: '0 0 0.25rem 0',
                    fontWeight: '500'
                  }}>
                    {activity.text}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    margin: 0
                  }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <Bell size={24} style={{ color: '#FFAC50' }} />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Thông báo
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { 
                type: 'info',
                title: 'Xe buýt sắp đến', 
                message: 'Xe buýt #12A sẽ đến điểm đón trong 3 phút nữa',
                time: 'Vừa xong',
                icon: Bus,
                color: '#3b82f6'
              },
              { 
                type: 'warning',
                title: 'Thay đổi lộ trình', 
                message: 'Lộ trình ngày mai có thay đổi nhỏ',
                time: '10 phút trước',
                icon: AlertCircle,
                color: '#f59e0b'
              },
              { 
                type: 'success',
                title: 'Đã đến trường', 
                message: 'Học sinh đã đến trường an toàn',
                time: '1 giờ trước',
                icon: CheckCircle,
                color: '#10b981'
              }
            ].map((notif, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #f3f4f6',
                  transition: 'background 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
              >
                <div style={{
                  padding: '0.5rem',
                  background: 'white',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  alignSelf: 'flex-start'
                }}>
                  <notif.icon size={20} style={{ color: notif.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {notif.title}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0 0 0.5rem 0',
                    lineHeight: '1.5'
                  }}>
                    {notif.message}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    margin: 0
                  }}>
                    {notif.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Info Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginTop: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <Phone size={24} style={{ color: '#FFAC50' }} />
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            Liên hệ khẩn cấp
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #f3f4f6'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
              Ban quản lý nhà trường
            </p>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              (028) 1234 5678
            </p>
          </div>
          <div style={{
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #f3f4f6'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
              Tài xế xe buýt #12A
            </p>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              0901 234 567
            </p>
          </div>
          <div style={{
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #f3f4f6'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
              Hotline hỗ trợ
            </p>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              1900 1234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}