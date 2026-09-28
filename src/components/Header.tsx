import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, MessageSquareText, Sparkles, History, Award, Camera } from 'lucide-react';
import { AvatarManagerModal } from './AvatarManagerModal';

export type ActiveTab = 'quiz' | 'essay' | 'advice' | 'tutor' | 'history';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  completedTestsCount: number;
  averageScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  completedTestsCount,
  averageScore,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    return localStorage.getItem('teacher_avatar_url') || null;
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setAvatarUrl(localStorage.getItem('teacher_avatar_url') || null);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('avatar-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('avatar-updated', handleStorageChange);
    };
  }, []);

  const handleSaveAvatar = (newAvatar: string | null) => {
    if (newAvatar) {
      try {
        localStorage.setItem('teacher_avatar_url', newAvatar);
        setAvatarUrl(newAvatar);
      } catch (e) {
        console.error('LocalStorage error saving avatar:', e);
      }
    } else {
      localStorage.removeItem('teacher_avatar_url');
      setAvatarUrl(null);
    }
    window.dispatchEvent(new Event('avatar-updated'));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      {/* Top Heritage Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 w-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            {/* Interactive Avatar Container */}
            <div className="relative group/avatar">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-900/20 group-hover/avatar:scale-105 transition-all overflow-hidden border border-amber-300/40 relative cursor-pointer"
                title="Bấm để tải lên / thay đổi ảnh đại diện (Avatar)"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar Thầy Dũng"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarUrl(null)}
                  />
                ) : (
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-white drop-shadow" />
                </div>
              </button>

              {/* Little Camera Badge */}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 bg-gradient-to-tr from-amber-500 to-red-500 text-white rounded-full flex items-center justify-center shadow-xs border-2 border-white hover:scale-110 transition-transform cursor-pointer"
                title="Đổi ảnh đại diện"
              >
                <Camera className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Site Title */}
            <div
              className="cursor-pointer group"
              onClick={() => setActiveTab('tutor')}
            >
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight font-serif group-hover:text-red-700 transition-colors">
                  Sử Việt THPT
                </span>
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-xs">
                  Thầy Dũng
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  GDPT 2018 (2025–2027)
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Trợ lý thông minh ôn tập Lịch sử 12: Trắc nghiệm 3 mức độ, Đúng/Sai & Tự luận
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs font-medium text-emerald-900 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã luyện: <strong className="text-emerald-800 font-bold">{completedTestsCount}</strong> bài</span>
            </div>
            {completedTestsCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300/80 text-xs font-medium text-amber-900 shadow-xs">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Điểm TB: <strong className="text-amber-950 font-bold">{averageScore.toFixed(1)}/10</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 border-t border-amber-100/60 scrollbar-none text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('tutor')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'tutor'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold shadow-sm shadow-red-600/30'
                : 'text-stone-600 hover:text-red-700 hover:bg-red-50/70'
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Khung chat Trợ lý Sử</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold shadow-sm shadow-red-600/30'
                : 'text-stone-600 hover:text-red-700 hover:bg-red-50/70'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Trắc nghiệm THPT</span>
          </button>

          <button
            onClick={() => setActiveTab('essay')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'essay'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold shadow-sm shadow-red-600/30'
                : 'text-stone-600 hover:text-red-700 hover:bg-red-50/70'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tự luận & Chấm điểm</span>
          </button>

          <button
            onClick={() => setActiveTab('advice')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'advice'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold shadow-sm shadow-red-600/30'
                : 'text-stone-600 hover:text-red-700 hover:bg-red-50/70'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Gợi ý bài cần ôn</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold shadow-sm shadow-red-600/30'
                : 'text-stone-600 hover:text-red-700 hover:bg-red-50/70'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Nhật ký học ({completedTestsCount})</span>
          </button>
        </nav>
      </div>

      {/* Avatar Management Modal */}
      <AvatarManagerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={avatarUrl}
        onSaveAvatar={handleSaveAvatar}
      />
    </header>
  );
};
