// File: components/ReportIncidentModal.tsx
'use client';

import { useState } from 'react';
import { X, AlertTriangle, Send, Camera } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const incidentTypes = [
  { id: 'traffic', label: 'Kẹt xe / Tắc đường' },
  { id: 'breakdown', label: 'Xe hỏng / Trục trặc kỹ thuật' },
  { id: 'accident', label: 'Va chạm / Tai nạn' },
  { id: 'student', label: 'Vấn đề về học sinh (Sức khỏe/Kỷ luật)' },
  { id: 'other', label: 'Khác' },
];

export default function ReportIncidentModal({ isOpen, onClose, onSubmit }: ModalProps) {
  const [type, setType] = useState('traffic');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Giả lập gửi dữ liệu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit({ type, description });
    setIsSubmitting(false);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        {/* Lớp nền tối */}
        <div 
          className="absolute inset-0  bg-opacity-100 bg-black/10 backdrop-blur-[2px] transition-opacity" 
          onClick={onClose}
        ></div>

      {/* Hộp nội dung */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header màu đỏ cảnh báo */}
        <div className="bg-red-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-lg font-bold uppercase">Báo cáo sự cố khẩn cấp</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Chọn loại sự cố */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại sự cố</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
            >
              {incidentTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Nhập mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chi tiết sự việc</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Mô tả chi tiết tình huống hiện tại..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
            ></textarea>
          </div>

          {/* Nút Upload ảnh (UI only) */}
          <button type="button" className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition">
            <Camera size={18} />
            <span>Đính kèm hình ảnh (nếu có)</span>
          </button>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-md shadow-red-200"
            >
              {isSubmitting ? 'Đang gửi...' : (
                <>
                  <Send size={18} />
                  Gửi báo cáo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}