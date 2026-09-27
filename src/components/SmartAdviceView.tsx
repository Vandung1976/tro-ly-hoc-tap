import React, { useState } from 'react';
import { TestAttempt, SmartAdviceResult } from '../types/history';
import { getApiHeaders } from '../utils/apiClient';
import {
  Award,
  AlertTriangle,
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock,
  Target,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

interface SmartAdviceViewProps {
  historyRecords: TestAttempt[];
  onSelectTopicToPractice: (topic: string) => void;
}

export const SmartAdviceView: React.FC<SmartAdviceViewProps> = ({
  historyRecords,
  onSelectTopicToPractice,
}) => {
  const [adviceResult, setAdviceResult] = useState<SmartAdviceResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Collect wrong questions
  const allWrongQuestions = historyRecords.flatMap((r) => r.wrongQuestions || []);

  const handleGenerateAdvice = async () => {
    setIsLoading(true);
    try {
      const summaryPayload = historyRecords.map((r) => ({
        topic: r.topic,
        score: r.score,
        date: r.date,
        wrongCount: (r.wrongQuestions || []).length,
        wrongQuestionsSample: (r.wrongQuestions || []).map((w) => ({
          question: w.questionText,
          userAnswer: w.userAnswer,
          correctAnswer: w.correctAnswer,
        })),
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          action: 'smart-advice',
          resultsSummary: summaryPayload.length > 0 ? summaryPayload : [
            {
              topic: 'Cuộc kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
              score: 6.0,
              wrongQuestionsSample: [
                {
                  question: 'Điểm khác biệt giữa Chiến tranh đặc biệt và Chiến tranh cục bộ?',
                  userAnswer: 'Quân Mỹ tham gia với tư cách cố vấn',
                  correctAnswer: 'Quân viễn chinh Mỹ giữ vai trò nòng cốt trực tiếp tham chiến',
                },
              ],
            },
            {
              topic: 'Cuộc kháng chiến chống thực dân Pháp (1945 - 1954)',
              score: 7.0,
              wrongQuestionsSample: [
                {
                  question: 'Hiệp định Giơ-ne-vơ 1954 quy định điều gì về tập kết chuyển quân?',
                  userAnswer: 'Giữ nguyên trạng lực lượng tại chỗ',
                  correctAnswer: 'Tập kết chuyển quân hai miền qua vĩ tuyến 17',
                },
              ],
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.success && data.advice) {
        setAdviceResult(data.advice);
      } else {
        alert(data.error || 'Không thể tạo gợi ý ôn tập lúc này.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi phân tích lộ trình ôn tập.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white p-5 sm:p-7 rounded-2xl shadow-md shadow-red-950/20 border border-red-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Target className="w-4 h-4 text-yellow-400" />
              <span>Phân tích năng lực & Gợi ý ôn tập cá nhân hóa</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight">
              Gợi ý bài học cần ôn lại từ Trợ lý AI
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-2xl leading-relaxed">
              Dựa trên các câu bạn đã làm sai và điểm số qua các bài thi, Trợ lý AI tự động phát hiện "vùng trũng kiến thức"
              và tạo ngay tóm tắt trọng tâm để bạn lấp đầy lỗ hổng ngay tức thì.
            </p>
          </div>

          <button
            onClick={handleGenerateAdvice}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-xs sm:text-sm transition-all shadow-md shadow-amber-950/30 shrink-0 disabled:opacity-50 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-stone-950 fill-stone-950" />
            <span>{isLoading ? 'AI đang phân tích dữ liệu...' : 'Phân tích & Đề xuất ôn tập'}</span>
          </button>
        </div>
      </div>

      {/* Summary of current status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-stone-100 text-stone-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500">Số bài đã luyện</div>
            <div className="text-lg font-bold text-stone-900">{historyRecords.length} bài</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500">Số câu từng làm sai</div>
            <div className="text-lg font-bold text-stone-900">{allWrongQuestions.length} câu</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500">Mục tiêu điểm THPT</div>
            <div className="text-lg font-bold text-stone-900">8.5+ Điểm</div>
          </div>
        </div>
      </div>

      {/* When AI advice is generated */}
      {adviceResult ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Assessment Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Đánh giá tổng quát năng lực</span>
            </div>
            <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-medium">
              {adviceResult.overallAssessment}
            </p>
          </div>

          {/* Recommended Topics */}
          <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  Các chuyên đề cần ôn tập ngay
                </h3>
                <p className="text-xs text-stone-500">
                  Những phần kiến thức học sinh thường hay nhầm lẫn trong kỳ thi tốt nghiệp
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {adviceResult.recommendedTopics?.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">
                        {topic.topicName}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300">
                        {topic.urgency || 'Cần củng cố'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {topic.reason}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectTopicToPractice(topic.topicName)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs font-bold transition-all shrink-0 self-start sm:self-center shadow-md shadow-red-600/20 active:scale-95"
                  >
                    <span>Luyện ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Recap Cards (Sổ tay kiến thức cấp tốc) */}
          <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  Sổ tay ôn tập cấp tốc (Quick Recap)
                </h3>
                <p className="text-xs text-stone-500">
                  Tổng hợp ngắn gọn những điểm then chốt nhất của các bài bạn cần ôn lại
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adviceResult.quickRecapCards?.map((card, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/40 space-y-3"
                >
                  <div className="border-b border-amber-200/60 pb-2">
                    <h4 className="font-bold text-sm text-amber-950">
                      {card.title}
                    </h4>
                    {card.timeline && (
                      <span className="inline-block text-[11px] font-semibold text-amber-800 mt-0.5">
                        ⏳ Mốc thời gian: {card.timeline}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Ý cốt lõi cần nhớ:
                    </div>
                    <ul className="text-xs space-y-1 text-stone-700">
                      {card.keyTakeaways?.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-700 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {card.examTrapsToAvoid && (
                    <div className="pt-2 border-t border-amber-200/50 flex items-start gap-1.5 text-xs text-rose-900 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Bẫy đề thi cần tránh:</strong> {card.examTrapsToAvoid}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-stone-800">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Kế hoạch hành động gợi ý cho bạn:</span>
            </h3>
            <div className="space-y-2">
              {adviceResult.actionPlan?.map((plan, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-200">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{plan}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Call to Action state */
        <div className="bg-white rounded-2xl border-2 border-dashed border-amber-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-100 to-amber-100 text-red-700 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-stone-900">
              Chưa có lộ trình gợi ý ôn tập
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
              Hãy bấm nút "Phân tích & Đề xuất ôn tập" phía trên để Trợ lý AI tổng hợp lịch sử làm bài,
              chỉ ra những bài cần đọc lại và chuẩn bị sổ tay kiến thức cho bạn!
            </p>
          </div>
          <button
            onClick={handleGenerateAdvice}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span>{isLoading ? 'Đang phân tích...' : 'Bắt đầu phân tích ngay'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
