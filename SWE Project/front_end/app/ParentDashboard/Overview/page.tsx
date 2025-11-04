// app/ParentDashboard/Overview/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Edit2, Save, X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { getParentByUserId, updateParent, Parent } from '@/app/API/parentService';

export default function ParentOverviewPage() {
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    loadParentData();
  }, []);

  const loadParentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy userId từ localStorage (sau khi login)
      const storedUserId = localStorage.getItem('userId');
      const userId = storedUserId || 'U004'; // Demo: U004
      
      console.log('📥 Loading parent data for userId:', userId);
      
      const data = await getParentByUserId(userId);
      setParent(data);
      
      // Set form data
      setFormData({
        fullName: data.FullName,
        phoneNumber: data.PhoneNumber,
        email: data.Email,
        address: data.Address || ''
      });
      
      console.log(' Parent data loaded:', data);
    } catch (err: any) {
      console.error(' Error loading parent:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage(null);
  };

  const handleCancel = () => {
    if (!parent) return;
    
    // Reset form về dữ liệu gốc
    setFormData({
      fullName: parent.FullName,
      phoneNumber: parent.PhoneNumber,
      email: parent.Email,
      address: parent.Address || ''
    });
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!parent) return;
    
    try {
      setSaving(true);
      setError(null);
      
      console.log('💾 Saving parent data:', formData);
      
      await updateParent(parent.ParentID, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address
      });
      
      console.log(' Parent updated successfully');
      
      // Reload data
      await loadParentData();
      setIsEditing(false);
      setSuccessMessage('Cập nhật thông tin thành công!');
      
      // Auto hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(' Error saving parent:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <Loader size={48} style={{ animation: 'spin 1s linear infinite' }} color="#FFAC50" />
        <p style={{ color: '#6b7280' }}>Đang tải thông tin...</p>
      </div>
    );
  }

  if (error && !parent) {
    return (
      <div style={{
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '1.5rem',
        borderRadius: '12px',
        margin: '2rem',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Không thể tải thông tin</h3>
        <p style={{ margin: '0 0 1rem 0' }}>{error}</p>
        <button
          onClick={loadParentData}
          style={{
            padding: '0.75rem 1.5rem',
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
    );
  }

  return (
    <div style={{
      backgroundColor: '#EEEEEE',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      {/* Success Message */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          background: '#d1fae5',
          color: '#065f46',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <CheckCircle size={24} />
          <span style={{ fontWeight: '500' }}>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
              color: '#1f2937',
              margin: '0 0 0.5rem 0'
            }}>
              Thông tin cá nhân
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Quản lý thông tin tài khoản của bạn
            </p>
          </div>
          
          {!isEditing ? (
            <button
              onClick={handleEdit}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #FFAC50 0%, #ff9030 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(255, 172, 80, 0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Edit2 size={18} />
              Chỉnh sửa
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleCancel}
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => !saving && (e.currentTarget.style.background = '#d1d5db')}
                onMouseLeave={(e) => !saving && (e.currentTarget.style.background = '#e5e7eb')}
              >
                <X size={18} />
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: saving ? '#d1d5db' : 'linear-gradient(135deg, #FFAC50 0%, #ff9030 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500',
                  boxShadow: saving ? 'none' : '0 4px 12px rgba(255, 172, 80, 0.3)'
                }}
              >
                {saving ? (
                  <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Lưu
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Avatar Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #FFAC50 0%, #ff9030 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '3rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(255, 172, 80, 0.3)'
            }}>
              {parent?.FullName?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#1f2937' }}>
                {parent?.FullName}
              </h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                ID: {parent?.ParentID}
              </p>
              <p style={{ margin: '0.25rem 0 0 0', color: '#9ca3af', fontSize: '0.75rem' }}>
                User ID: {parent?.UserID}
              </p>
            </div>
          </div>

          {/* Information Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Full Name */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                <User size={16} />
                Họ và tên
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FFAC50'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              ) : (
                <p style={{ margin: 0, fontSize: '1rem', color: '#1f2937', fontWeight: '500' }}>
                  {parent?.FullName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                <Phone size={16} />
                Số điện thoại
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FFAC50'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              ) : (
                <p style={{ margin: 0, fontSize: '1rem', color: '#1f2937', fontWeight: '500' }}>
                  {parent?.PhoneNumber}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                <Mail size={16} />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FFAC50'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              ) : (
                <p style={{ margin: 0, fontSize: '1rem', color: '#1f2937', fontWeight: '500' }}>
                  {parent?.Email}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                <MapPin size={16} />
                Địa chỉ
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FFAC50'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              ) : (
                <p style={{ margin: 0, fontSize: '1rem', color: '#1f2937', fontWeight: '500', lineHeight: '1.5' }}>
                  {parent?.Address || 'Chưa cập nhật'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}