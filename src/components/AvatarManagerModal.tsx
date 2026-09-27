import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Link, Trash2, X, Check, Image as ImageIcon, BookOpen, Sparkles } from 'lucide-react';
import { DEFAULT_AVATAR } from '../constants/avatar';

interface AvatarManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string | null;
  onSaveAvatar: (newAvatarUrl: string | null) => void;
}

export const AvatarManagerModal: React.FC<AvatarManagerModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
}) => {
  const [preview, setPreview] = useState<string>(currentAvatar || DEFAULT_AVATAR);
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPreview(currentAvatar || DEFAULT_AVATAR);
      setErrorMsg('');
      setUrlInput('');
    }
  }, [isOpen, currentAvatar]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WebP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Dung lượng ảnh tối đa là 5MB để đảm bảo tốc độ tải trang.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Vui lòng nhập đường dẫn ảnh.');
      return;
    }
    setErrorMsg('');
    setPreview(urlInput.trim());
    setUrlInput('');
  };

  const handleSave = () => {
    onSaveAvatar(preview);
    onClose();
  };

  const handleResetToDefault = () => {
    setPreview(DEFAULT_AVATAR);
    onSaveAvatar(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-amber-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Thay đổi Ảnh Avatar</h3>
              <p className="text-xs text-amber-200">Vị trí biểu tượng đầu trang & Trợ lý Sử</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Avatar Preview Section */}
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-red-900/25 border-2 border-amber-300">
                {preview ? (
                  <img
                    src={preview}
                    alt="Xem trước Avatar"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setErrorMsg('Không thể tải ảnh từ đường dẫn này. Vui lòng kiểm tra lại URL.');
                      setPreview(DEFAULT_AVATAR);
                    }}
                  />
                ) : (
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md border-2 border-white transition-transform hover:scale-110"
                title="Tải ảnh mới"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-stone-600">
              {preview ? 'Xem trước ảnh đại diện của bạn' : 'Đang dùng biểu tượng sách mặc định'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <span className="font-bold shrink-0">Lưu ý:</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action 1: Upload from Computer/Phone */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Cách 1: Tải ảnh từ thiết bị
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-50 to-amber-50 hover:from-red-100 hover:to-amber-100 text-red-900 font-bold text-xs sm:text-sm border border-red-200/90 shadow-2xs transition-all active:scale-98"
            >
              <Upload className="w-4 h-4 text-red-600" />
              <span>Chọn ảnh từ máy tính hoặc điện thoại</span>
            </button>
          </div>

          {/* Action 2: Enter URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Cách 2: Nhập đường dẫn ảnh trực tuyến
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-xs text-stone-800 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold shrink-0 transition-colors"
              >
                Xem thử
              </button>
            </div>
          </div>

          {/* Helper Tips */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>💡 Mẹo cố định ảnh trên Vercel:</span>
            </p>
            <p className="text-stone-600 leading-relaxed">
              Bạn có thể đặt file ảnh chân dung của mình tên là <strong>avatar.png</strong> vào thư mục <strong>public/</strong> của dự án, hệ thống sẽ tự động ưu tiên nhận diện làm Avatar chính thức.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between gap-3">
          {preview ? (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-red-700 py-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa ảnh (dùng lại biểu tượng gốc)</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 text-xs font-semibold transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-red-700/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Áp dụng Avatar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
