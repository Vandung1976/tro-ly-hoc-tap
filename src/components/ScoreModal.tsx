import React from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

interface ScoreModalProps {
  score: number;
  maxScore: number;
  topic: string;
  totalQuestions: number;
  wrongQuestions: any[];
  onRetry: () => void;
  onGoToAdvice: () => void;
  onGoToTutor: () => void;
  onClose: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  score,
  maxScore,
  topic,
  totalQuestions,
  wrongQuestions,
  onRetry,
  onGoToAdvice,
  onGoToTutor,
  onClose,
}) => {
  const percentage = Math.round((score / maxScore) * 100);

  let badgeText = 'Xuất sắc! Nắm vững kiến thức';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (score < 5) {
    badgeText = 'Cần ôn tập lại các mốc lịch sử cốt lõi';
    badgeColor = 'bg-red-100 text-red-800 border-red-300';
  } else if (score < 8) {
    badgeText = 'Khá tốt! Cần chú ý các bẫy đề thi';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
        {/* Top Celebration */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-600 to-yellow-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-900/25">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-serif text-stone-900 tracking-tight">
            Kết Quả Bài Luyện Tập Lịch Sử
          </h2>

          <div className="text-xs sm:text-sm text-stone-600 font-medium">
            Chuyên đề: <strong className="text-red-950 font-bold">{topic}</strong>
          </div>

          {/* Big Score Box */}
          <div className="inline-flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 to-red-50/60 border border-amber-300 shadow-2xs">
            <div className="text-3xl sm:text-4xl font-black text-red-950">
              {score} <span className="text-lg font-bold text-stone-500">/ 10</span>
            </div>
            <div className="text-xs text-stone-600 font-medium mt-1">Đạt {percentage}% điểm tối đa</div>
          </div>

          <div>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${badgeColor} shadow-2xs`}>
              {badgeText}
            </span>
          </div>
        </div>

        {/* Wrong Questions Breakdown */}
        {wrongQuestions.length > 0 && (
          <div className="mb-6 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Các câu trả lời chưa đúng ({wrongQuestions.length} câu):</span>
              </h3>
              <span className="text-xs text-stone-500">Cần đọc kỹ giải thích</span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {wrongQuestions.map((wq, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 space-y-1.5"
                >
                  <div className="font-semibold text-stone-900">{wq.questionText}</div>
                  <div className="text-red-700">
                    <strong>Bạn chọn:</strong> {wq.userAnswer}
                  </div>
                  <div className="text-emerald-700 font-medium">
                    <strong>Đáp án đúng:</strong> {wq.correctAnswer}
                  </div>
                  {wq.explanation && (
                    <div className="text-stone-600 pt-1 border-t border-stone-200/60 leading-relaxed text-[11px]">
                      💡 <strong>Giải thích:</strong> {wq.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Grid */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại bài thi này</span>
            </button>

            <button
              onClick={onGoToAdvice}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-amber-900/10"
            >
              <Sparkles className="w-4 h-4" />
              <span>Xem gợi ý bài cần ôn lại</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onGoToTutor}
              className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1"
            >
              <span>Hỏi Trợ lý Sử về các câu sai này</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-800 font-medium px-3 py-1"
            >
              Đóng bảng điểm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
