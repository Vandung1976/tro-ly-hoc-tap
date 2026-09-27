import React, { useState } from 'react';
import { Sparkles, Play, CheckCircle2, SlidersHorizontal, BookOpen, Layers } from 'lucide-react';
import { SAMPLE_TOPICS } from '../data/sampleQuestions';
import { QuestionType, Difficulty } from '../types/history';

interface QuizModeSelectorProps {
  onStartQuiz: (options: {
    topic: string;
    questionType: QuestionType;
    difficulty: Difficulty;
    count: number;
    useAI: boolean;
  }) => void;
  isLoading: boolean;
}

export const QuizModeSelector: React.FC<QuizModeSelectorProps> = ({
  onStartQuiz,
  isLoading,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(SAMPLE_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [count, setCount] = useState<number>(5);

  const activeTopic = customTopic.trim() ? customTopic.trim() : selectedTopic;

  const handleStartPreset = () => {
    onStartQuiz({
      topic: activeTopic,
      questionType,
      difficulty,
      count,
      useAI: false,
    });
  };

  const handleStartAI = () => {
    onStartQuiz({
      topic: activeTopic,
      questionType,
      difficulty,
      count,
      useAI: true,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-amber-100 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 text-white shadow-sm shadow-red-900/15">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-stone-900 font-serif">
              Cấu hình bài luyện tập Lịch sử
            </h2>
            <p className="text-xs text-stone-600">
              Chọn dạng bài thi chuẩn tốt nghiệp THPT và nội dung bạn muốn ôn tập cùng Thầy Dũng
            </p>
          </div>
        </div>
      </div>

      {/* Dạng câu hỏi */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-red-900 uppercase tracking-wider mb-2.5">
          1. Định dạng câu hỏi
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => setQuestionType('multiple_choice')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
              questionType === 'multiple_choice'
                ? 'border-red-500 bg-gradient-to-r from-red-50/80 to-amber-50/60 ring-2 ring-red-500/20 shadow-xs'
                : 'border-stone-200 hover:border-amber-300 bg-white'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${questionType === 'multiple_choice' ? 'bg-gradient-to-tr from-red-600 to-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-600'}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                Trắc nghiệm 4 lựa chọn (A, B, C, D)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">Phổ biến</span>
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Kiểm tra kiến thức cốt lõi, mốc thời gian, nhân vật, nguyên nhân & ý nghĩa lịch sử.
              </p>
            </div>
          </div>

          <div
            onClick={() => setQuestionType('true_false')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
              questionType === 'true_false'
                ? 'border-red-500 bg-gradient-to-r from-red-50/80 to-amber-50/60 ring-2 ring-red-500/20 shadow-xs'
                : 'border-stone-200 hover:border-amber-300 bg-white'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${questionType === 'true_false' ? 'bg-gradient-to-tr from-red-600 to-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-600'}`}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                Trắc nghiệm Đúng / Sai (Đoạn tư liệu)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">Đề mới GDPT</span>
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                1 đoạn tư liệu lịch sử + 4 mệnh đề a, b, c, d với thang điểm lũy tiến chính thức.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chủ đề ôn tập */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-red-900 uppercase tracking-wider mb-2.5">
          2. Chọn chuyên đề Lịch sử
        </label>
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setSelectedTopic(t);
                  setCustomTopic('');
                }}
                className={`text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  selectedTopic === t && !customTopic
                    ? 'border-red-500 bg-gradient-to-r from-red-50 to-amber-50/80 text-red-950 font-bold shadow-xs ring-1 ring-red-400/30'
                    : 'border-stone-200 hover:border-amber-300 text-stone-700 bg-stone-50/60 hover:bg-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <div className="text-xs text-stone-500 mb-1 font-medium">Hoặc nhập chủ đề/sự kiện cụ thể bạn cần trợ lý tạo đề:</div>
            <input
              type="text"
              placeholder="VD: Chiến dịch Điện Biên Phủ trên không 1972, Đại hội VI năm 1986..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Độ khó & Số câu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-red-900 uppercase tracking-wider mb-2">
            3. Mức độ nhận thức
          </label>
          <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            {[
              { id: 'easy', label: 'Nhận biết 🟢' },
              { id: 'medium', label: 'Thông hiểu 🟡' },
              { id: 'hard', label: 'Vận dụng 🔴' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id as Difficulty)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  difficulty === d.id
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-red-900 uppercase tracking-wider mb-2">
            4. Số lượng câu hỏi
          </label>
          <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            {[3, 5, 8, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCount(num)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  count === num
                    ? 'bg-white text-red-900 shadow-xs border border-amber-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {num} câu
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-amber-100">
        <button
          onClick={handleStartPreset}
          disabled={isLoading}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition-all shadow-xs disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Làm ngay câu hỏi chuẩn chọn lọc</span>
        </button>

        <button
          onClick={handleStartAI}
          disabled={isLoading}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-bold text-sm transition-all shadow-md shadow-red-600/25 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-yellow-200" />
          <span>{isLoading ? 'Đang tạo câu hỏi với AI...' : 'Trợ lý AI tạo đề mới theo yêu cầu'}</span>
        </button>
      </div>
    </div>
  );
};
