import React from 'react';
import { TestAttempt } from '../types/history';
import { Award, Clock, AlertTriangle, BookOpen, Trash2, ArrowRight } from 'lucide-react';

interface HistoryLogViewProps {
  historyRecords: TestAttempt[];
  onClearHistory: () => void;
  onRetakeTopic: (topic: string) => void;
}

export const HistoryLogView: React.FC<HistoryLogViewProps> = ({
  historyRecords,
  onClearHistory,
  onRetakeTopic,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-red-900 via-amber-900 to-stone-900 text-white p-5 sm:p-7 rounded-2xl shadow-md border border-red-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>Tiến trình & Kết quả ôn tập</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight">
            Nhật ký Luyện tập Lịch sử THPT
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xl">
            Theo dõi sự tiến bộ, điểm số và xem lại những câu hỏi cần củng cố kiến thức cùng Thầy Dũng
          </p>
        </div>

        {historyRecords.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử luyện tập?')) {
                onClearHistory();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-red-500/80 border border-white/20 text-white text-xs font-semibold transition-all self-start sm:self-auto shadow-xs active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa lịch sử</span>
          </button>
        )}
      </div>

      {historyRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-amber-200 p-8 sm:p-14 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-100 to-amber-100 text-red-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">Chưa có bài luyện tập nào</h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-md mx-auto leading-relaxed">
            Hãy bắt đầu làm các bài trắc nghiệm 4 lựa chọn, đúng/sai hoặc luyện viết bài tự luận để ghi lại tiến độ học tập nhé.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyRecords.map((rec) => {
            const hasWrong = (rec.wrongQuestions || []).length > 0;
            const isHigh = rec.score >= 8;
            const isMedium = rec.score >= 5 && rec.score < 8;

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 sm:p-6 transition-all hover:border-red-400 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-amber-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm sm:text-base text-stone-900">
                        {rec.topic}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-950 border border-amber-300">
                        {rec.questionType === 'multiple_choice'
                          ? 'Trắc nghiệm 4 chọn'
                          : rec.questionType === 'true_false'
                          ? 'Trắc nghiệm Đúng/Sai'
                          : 'Tự luận'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {rec.date}
                      </span>
                      <span>• Tổng: <strong>{rec.totalQuestions}</strong> câu</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Điểm số</div>
                      <div className={`text-xl font-black ${isHigh ? 'text-emerald-700' : isMedium ? 'text-amber-700' : 'text-rose-700'}`}>
                        {rec.score} <span className="text-xs font-semibold text-stone-400">/ 10</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRetakeTopic(rec.topic)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-red-50 to-amber-50 hover:from-red-100 hover:to-amber-100 text-red-900 border border-red-200 text-xs font-bold transition-all shadow-2xs hover:scale-102"
                      title="Luyện lại chuyên đề này"
                    >
                      <span>Luyện lại</span>
                      <ArrowRight className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Wrong questions summary if any */}
                {hasWrong && (
                  <div className="mt-3.5 pt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Các câu cần lưu ý củng cố ({rec.wrongQuestions.length} câu):</span>
                    </div>
                    <div className="space-y-2">
                      {rec.wrongQuestions.map((wq, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-stone-800 leading-relaxed shadow-2xs"
                        >
                          <div className="font-bold text-stone-900 mb-1">
                            • {wq.questionText}
                          </div>
                          {wq.correctAnswer && (
                            <div className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block border border-emerald-200 mt-0.5">
                              ✓ Đáp án chuẩn: {wq.correctAnswer}
                            </div>
                          )}
                          {wq.explanation && (
                            <div className="text-stone-700 mt-1 text-[11px] leading-normal">
                              💡 <strong>Giải thích:</strong> {wq.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
