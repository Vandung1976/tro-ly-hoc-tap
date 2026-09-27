import React, { useState, useMemo } from 'react';
import { EssayQuestion, EssayGradingResult, Difficulty } from '../types/history';
import { SAMPLE_ESSAYS } from '../data/sampleQuestions';
import { getApiHeaders } from '../utils/apiClient';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  FileText,
  Search,
  Filter,
  Flame,
  ListChecks,
  ChevronRight,
  RotateCcw,
  X,
  Target,
  GraduationCap,
  ClipboardList,
  PenTool,
  HelpCircle,
  PlusCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface EssayViewProps {
  onSaveEssayAttempt: (data: {
    topic: string;
    question: string;
    score: number;
    feedback: string;
    missingPoints: string[];
    recommendedReview: string;
  }) => void;
}

export const EssayView: React.FC<EssayViewProps> = ({ onSaveEssayAttempt }) => {
  const [questions, setQuestions] = useState<EssayQuestion[]>(SAMPLE_ESSAYS);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingResult, setGradingResult] = useState<EssayGradingResult | null>(null);

  // Panels visibility
  const [showSuggestedAnswer, setShowSuggestedAnswer] = useState<boolean>(false);
  const [showKeyOutline, setShowKeyOutline] = useState<boolean>(false);
  const [showRubric, setShowRubric] = useState<boolean>(false);
  const [showTeacherGenerator, setShowTeacherGenerator] = useState<boolean>(true);

  // Custom Teacher Generation Inputs
  const [customTopic, setCustomTopic] = useState<string>('');
  const [customKeyword, setCustomKeyword] = useState<string>('');
  const [customStyle, setCustomStyle] = useState<string>('phan-tich');
  const [customDiff, setCustomDiff] = useState<Difficulty>('medium');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState<boolean>(false);
  const [generatorSuccessMsg, setGeneratorSuccessMsg] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const currentQ = questions[selectedIdx] || SAMPLE_ESSAYS[0];
  const wordCount = studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0;

  // Categories list
  const categories = [
    { id: 'all', label: 'Tất cả chuyên đề' },
    { id: 'chong-phap', label: 'Kháng chiến chống Pháp (1945–1954)', filterKey: 'Pháp' },
    { id: 'chong-my', label: 'Kháng chiến chống Mỹ (1954–1975)', filterKey: 'Mỹ' },
    { id: 'cach-mang', label: 'Phong trào CM & Đảng (1930–1945)', filterKey: '1930' },
    { id: 'doi-moi-qt', label: 'Đổi mới & Quan hệ quốc tế', filterKey: 'Đổi mới' },
  ];

  // Quick suggestion topics for the teacher generator
  const quickTopicSuggestions = [
    { topic: 'Chiến thắng Điện Biên Phủ năm 1954', keyword: 'Kế hoạch Nava & Bước ngoặt' },
    { topic: 'Hiệp định Pari năm 1973', keyword: 'Đánh cho Mỹ cút & Rút quân' },
    { topic: 'Cách mạng tháng Tám năm 1945', keyword: 'Thời cơ ngàn năm có một' },
    { topic: 'Phong trào Đồng khởi (1959 - 1960)', keyword: 'Nghị quyết 15 & Bến Tre' },
    { topic: 'Tổng tiến công và nổi dậy Tết Mậu Thân 1968', keyword: 'Chiến tranh cục bộ & Đàm phán' },
    { topic: 'Chiến dịch Biên giới Thu - Đông 1950', keyword: 'Quyền chủ động chiến lược' },
    { topic: 'Đường lối Đổi mới Đại hội VI (1986)', keyword: 'Kinh tế nhiều thành phần' },
    { topic: 'Việt Nam gia nhập ASEAN (1995)', keyword: 'Hội nhập & Hòa bình khu vực' },
  ];

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedCategory !== 'all') {
        const catObj = categories.find((c) => c.id === selectedCategory);
        if (catObj && catObj.filterKey) {
          if (catObj.id === 'cach-mang') {
            const isMatch = q.topic.includes('1930') || q.topic.includes('1945') || q.topic.includes('tháng Tám');
            if (!isMatch) return false;
          } else if (catObj.id === 'doi-moi-qt') {
            const isMatch = q.topic.includes('Đổi mới') || q.topic.includes('thế giới') || q.topic.includes('quốc tế') || q.topic.includes('ASEAN');
            if (!isMatch) return false;
          } else if (!q.topic.includes(catObj.filterKey)) {
            return false;
          }
        }
      }

      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) {
        return false;
      }

      if (searchQuery.trim()) {
        const qLower = searchQuery.toLowerCase();
        const inQuestion = q.question.toLowerCase().includes(qLower);
        const inTopic = q.topic.toLowerCase().includes(qLower);
        const inKeyPoints = q.keyPoints.some((kp) => kp.toLowerCase().includes(qLower));
        if (!inQuestion && !inTopic && !inKeyPoints) return false;
      }

      return true;
    });
  }, [questions, selectedCategory, selectedDifficulty, searchQuery]);

  // AI Grade Essay
  const handleGradeEssay = async () => {
    if (!studentAnswer.trim()) {
      alert('Vui lòng nhập bài làm của bạn trước khi nộp chấm điểm!');
      return;
    }

    setIsGrading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          action: 'grade-essay',
          question: currentQ.question,
          studentAnswer,
          suggestedAnswer: currentQ.suggestedAnswer,
          keyPoints: currentQ.keyPoints,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setGradingResult(data.result);
        onSaveEssayAttempt({
          topic: currentQ.topic,
          question: currentQ.question,
          score: data.result.score,
          feedback: data.result.generalFeedback,
          missingPoints: data.result.missingOrIncorrect || [],
          recommendedReview: data.result.recommendedReview || currentQ.topic,
        });
      } else {
        alert(data.error || 'Có lỗi khi chấm bài. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ AI chấm điểm.');
    } finally {
      setIsGrading(false);
    }
  };

  // Generate new essay question with AI as Teacher
  const handleGenerateTeacherEssay = async (overrideTopic?: string, overrideKeyword?: string) => {
    const topicToUse = (overrideTopic || customTopic || currentQ.topic).trim();
    const keywordToUse = (overrideKeyword !== undefined ? overrideKeyword : customKeyword).trim();

    if (!topicToUse) {
      alert('Vui lòng nhập chủ đề hoặc từ khóa lịch sử cần biên soạn!');
      return;
    }

    setIsGeneratingCustom(true);
    setGeneratorSuccessMsg(null);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          topic: topicToUse,
          keyword: keywordToUse,
          essayStyle: customStyle,
          difficulty: customDiff,
          questionType: 'essay',
          count: 1,
        }),
      });

      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        const newQ: EssayQuestion = data.questions[0];
        setQuestions((prev) => [newQ, ...prev]);
        setSelectedIdx(0);
        setStudentAnswer('');
        setGradingResult(null);
        setShowSuggestedAnswer(false);
        setShowKeyOutline(true);
        setShowRubric(true);
        setGeneratorSuccessMsg(`Giáo viên AI đã biên soạn thành công câu hỏi tự luận về chủ đề "${topicToUse}" kèm Hướng dẫn chấm và Đáp án chi tiết!`);
        setTimeout(() => setGeneratorSuccessMsg(null), 6000);
      } else {
        alert(data.error || 'Không thể tạo đề tự luận lúc này.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Lỗi kết nối khi giáo viên biên soạn câu hỏi tự luận.');
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Insert writing template
  const handleInsertTemplate = () => {
    const template = `1. MỞ BÀI:
- Giới thiệu khái quát bối cảnh lịch sử và vấn đề cần giải quyết: 

2. THÂN BÀI:
- Luận điểm 1 (Bối cảnh / Nguyên nhân): 
- Luận điểm 2 (Diễn biến cốt lõi / Điểm then chốt): 
- Luận điểm 3 (Ý nghĩa lịch sử / Tác động sâu rộng): 

3. KẾT LUẬN & LIÊN HỆ:
- Khẳng định giá trị lịch sử và bài học kinh nghiệm cho sự nghiệp xây dựng, bảo vệ Tổ quốc hôm nay: `;
    setStudentAnswer((prev) => (prev ? prev + '\n\n' + template : template));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-red-900 via-amber-900 to-stone-900 text-white p-5 sm:p-7 rounded-2xl shadow-md border border-red-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4 text-yellow-400" />
              <span>Góc Giáo viên Lịch sử THPT • GDPT 2018</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight">
              Biên soạn Câu hỏi Tự luận & Chấm điểm Sư phạm
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-2xl leading-relaxed">
              Thầy Dũng đóng vai trò giáo viên Lịch sử THPT biên soạn các đề thi tự luận chất lượng cao
              theo bất kỳ chủ đề, từ khóa yêu cầu, kèm <strong>Hướng dẫn chấm điểm (Rubric)</strong> và <strong>Đáp án chi tiết</strong>.
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => setShowTeacherGenerator(!showTeacherGenerator)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-xs sm:text-sm transition-all shadow-md shadow-amber-950/30 active:scale-95"
            >
              <PenTool className="w-4 h-4 text-stone-950 fill-stone-950" />
              <span>{showTeacherGenerator ? 'Đóng công cụ biên soạn' : 'Mở công cụ biên soạn đề'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TEACHER GENERATOR PANEL: Biến mọi chủ đề/từ khóa thành đề tự luận & Hướng dẫn chấm */}
      {showTeacherGenerator && (
        <div className="bg-gradient-to-br from-red-50/70 via-amber-50/50 to-orange-50/60 rounded-2xl border-2 border-amber-300 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-amber-600 text-white shadow-2xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-red-950 font-serif">
                  Biên soạn đề tự luận theo Chủ đề hoặc Từ khóa
                </h3>
                <p className="text-xs text-stone-600">
                  Nhập chủ đề/từ khóa bạn muốn, Giáo viên AI sẽ thiết kế đề thi, biểu điểm chấm và đáp án chuẩn
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-red-100 text-red-900 font-bold border border-red-200">
              Chuẩn GDPT 2018
            </span>
          </div>

          {/* Input fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-red-950 mb-1">
                Chủ đề / Sự kiện lịch sử cần ra đề:
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Chiến thắng Điện Biên Phủ 1954, Hiệp định Pari 1973..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-amber-300 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-red-950 mb-1">
                Từ khóa trọng tâm (Tùy chọn):
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Thời cơ, Kế hoạch Nava, Bước ngoặt, Rút quân..."
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-amber-300 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-white"
              />
            </div>
          </div>

          {/* Style & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Dạng câu hỏi tự luận:
              </label>
              <select
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-red-500 bg-white font-medium"
              >
                <option value="phan-tich">🔍 Phân tích nguyên nhân & ý nghĩa lịch sử</option>
                <option value="so-sanh">⚖️ So sánh hai sự kiện / chiến lược chiến tranh</option>
                <option value="danh-gia">🎯 Đánh giá ý nghĩa bước ngoặt / vai trò lịch sử</option>
                <option value="bai-hoc">💡 Phân tích nguyên nhân & rút ra bài học kinh nghiệm</option>
                <option value="chung-minh">📜 Chứng minh / bình luận một nhận định lịch sử</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Mức độ nhận thức:
              </label>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setCustomDiff('medium')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    customDiff === 'medium'
                      ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  🟡 Thông hiểu (Vừa sức)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDiff('hard')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    customDiff === 'hard'
                      ? 'bg-red-600 text-white border-red-700 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  🔴 Vận dụng cao (Phân tích sâu)
                </button>
              </div>
            </div>
          </div>

          {/* Quick topic suggestion tags */}
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
              Gợi ý các chủ đề trọng tâm hay gặp trong đề thi (Bấm để chọn nhanh):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickTopicSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCustomTopic(item.topic);
                    setCustomKeyword(item.keyword);
                    handleGenerateTeacherEssay(item.topic, item.keyword);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/80 text-stone-800 hover:text-red-900 border border-amber-200 font-medium transition-all shadow-2xs hover:scale-102"
                >
                  + {item.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleGenerateTeacherEssay()}
              disabled={isGeneratingCustom}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/25 disabled:opacity-40 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span>
                {isGeneratingCustom ? 'Giáo viên AI đang biên soạn đề & biểu điểm...' : 'Biên soạn đề thi & Hướng dẫn chấm'}
              </span>
            </button>
          </div>

          {generatorSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{generatorSuccessMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Catalog & Filter Section */}
      <div className="bg-white rounded-2xl border border-amber-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Header & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900 font-serif">
                Tuyển tập đề thi tự luận ({filteredQuestions.length}/{questions.length} đề)
              </h2>
              <p className="text-xs text-stone-500">
                Nhấp vào đề bài bất kỳ bên dưới để nạp đề vào khung làm bài
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo sự kiện, từ khóa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-stone-50/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all shrink-0 whitespace-nowrap shadow-2xs ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-red-700 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-stone-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            Mức độ:
          </span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'medium', label: 'Thông hiểu 🟡' },
            { id: 'hard', label: 'Vận dụng cao 🔴' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDifficulty(d.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedDifficulty === d.id
                  ? 'bg-stone-900 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 bg-stone-50'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Question Cards Grid */}
        {filteredQuestions.length === 0 ? (
          <div className="py-8 text-center text-stone-500 text-xs">
            Không tìm thấy đề tự luận phù hợp với bộ lọc hiện tại. Hãy thử tìm từ khóa khác nhé.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {filteredQuestions.map((q) => {
              const originalIndex = questions.findIndex((item) => item.id === q.id);
              const isSelected = selectedIdx === originalIndex;

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedIdx(originalIndex);
                    setStudentAnswer('');
                    setGradingResult(null);
                    setShowSuggestedAnswer(false);
                    setShowKeyOutline(false);
                    setShowRubric(false);
                  }}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'border-red-500 bg-gradient-to-br from-red-50/90 via-amber-50/50 to-white shadow-md ring-2 ring-red-400/30'
                      : 'border-stone-200 hover:border-amber-400 bg-white hover:bg-stone-50/60 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200">
                        {q.topic}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.difficulty === 'hard'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {q.difficulty === 'hard' ? 'Vận dụng cao' : 'Thông hiểu'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-[13px] font-bold text-stone-900 line-clamp-3 leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1 font-medium text-amber-900">
                      <ListChecks className="w-3.5 h-3.5 text-amber-600" />
                      {q.keyPoints.length} luận điểm then chốt
                    </span>

                    <span className={`font-bold flex items-center gap-0.5 ${isSelected ? 'text-red-700' : 'text-stone-400'}`}>
                      {isSelected ? 'Đang chọn' : 'Luyện đề này'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Question Display & Writing Area */}
      <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-md p-5 sm:p-7 space-y-4">
        {/* Top Header of Selected Question */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs">
              Đề số {(selectedIdx + 1).toString().padStart(2, '0')}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
              {currentQ.topic}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-red-800 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              Thang điểm 10
            </span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {currentQ.keyPoints.length} luận điểm bắt buộc
            </span>
          </div>
        </div>

        {/* Question Title */}
        <h2 className="text-base sm:text-lg font-black text-stone-900 leading-relaxed font-serif">
          {currentQ.question}
        </h2>

        {/* Guide note if any */}
        {currentQ.guideNote && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-xs text-amber-950 shadow-2xs">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-red-950">Lời dặn dò phương pháp làm bài:</strong> {currentQ.guideNote}
            </div>
          </div>
        )}

        {/* Pedagogical Toolbar Buttons: Key Points, Rubric, Suggested Answer */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowKeyOutline(!showKeyOutline)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              showKeyOutline
                ? 'bg-red-600 text-white border-red-700 shadow-xs'
                : 'bg-red-50 hover:bg-red-100 text-red-900 border-red-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{showKeyOutline ? 'Đóng gợi ý luận điểm' : '🎯 Dàn ý luận điểm then chốt'}</span>
          </button>

          {currentQ.rubric && (
            <button
              type="button"
              onClick={() => setShowRubric(!showRubric)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                showRubric
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{showRubric ? 'Đóng biểu điểm' : '📋 Hướng dẫn chấm & Biểu điểm thang 10'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSuggestedAnswer(!showSuggestedAnswer)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              showSuggestedAnswer
                ? 'bg-stone-800 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showSuggestedAnswer ? 'Ẩn đáp án mẫu' : '📖 Xem bài giải mẫu chuẩn SGK'}</span>
          </button>
        </div>

        {/* Key Points Checklist Panel */}
        {showKeyOutline && (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 space-y-2 text-xs text-stone-800 animate-in fade-in">
            <div className="font-bold text-red-950 flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-red-600" />
              <span>Dàn ý các luận điểm bắt buộc (Key Points checklist):</span>
            </div>
            <ul className="space-y-1.5 pl-1">
              {currentQ.keyPoints.map((kp, idx) => (
                <li key={idx} className="flex items-start gap-2 text-stone-800 leading-relaxed">
                  <span className="w-5 h-5 rounded-md bg-amber-200 text-amber-950 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{kp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rubric / Marking Scheme Panel */}
        {showRubric && currentQ.rubric && (
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-2 text-xs text-stone-800 animate-in fade-in">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-emerald-700" />
              <span>Hướng dẫn chấm điểm & Tiêu chí phân bổ điểm (Thang 10 điểm):</span>
            </div>
            <div className="whitespace-pre-line leading-relaxed text-emerald-950 bg-white p-3.5 rounded-lg border border-emerald-200">
              {currentQ.rubric}
            </div>
          </div>
        )}

        {/* Suggested answer panel */}
        {showSuggestedAnswer && (
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 text-xs sm:text-sm text-stone-800 shadow-sm animate-in fade-in">
            <h4 className="font-extrabold text-amber-950 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Bài giải mẫu chuẩn Lịch sử THPT:</span>
            </h4>
            <div className="whitespace-pre-line leading-relaxed text-stone-800 bg-white p-5 rounded-xl border border-amber-200 mb-3 shadow-2xs font-sans">
              {currentQ.suggestedAnswer}
            </div>
          </div>
        )}

        {/* Textarea for student answer */}
        <div className="space-y-2 pt-2 border-t border-amber-100">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <div className="flex items-center gap-2">
              <label className="font-bold text-red-900 uppercase tracking-wider text-[11px]">
                Bài làm của bạn:
              </label>
              <button
                type="button"
                onClick={handleInsertTemplate}
                className="text-[11px] text-amber-800 hover:text-red-700 underline font-semibold"
              >
                + Chèn dàn ý mẫu (Mở - Thân - Kết)
              </button>
            </div>
            <span className="font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
              {wordCount} từ
            </span>
          </div>

          <textarea
            rows={9}
            placeholder="Nhập câu trả lời hoặc dàn ý phân tích lịch sử của bạn tại đây (ví dụ: Nêu bối cảnh lịch sử, diễn biến cốt lõi, ý nghĩa, bài học kinh nghiệm)..."
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            className="w-full text-xs sm:text-sm p-4 rounded-xl border border-stone-300 focus:outline-none focus:ring-4 focus:ring-red-500/15 focus:border-red-500 leading-relaxed text-stone-800 placeholder:text-stone-400 resize-y bg-stone-50/40 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {studentAnswer.trim() ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa nội dung đã viết để làm lại từ đầu?')) {
                  setStudentAnswer('');
                  setGradingResult(null);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 hover:bg-red-50 text-stone-600 hover:text-red-700 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa làm lại</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={handleGradeEssay}
            disabled={isGrading || !studentAnswer.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-600/25 disabled:opacity-40 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span>{isGrading ? 'Giáo viên AI đang chấm bài & phân tích...' : 'Nộp bài cho Giáo viên AI chấm điểm'}</span>
          </button>
        </div>
      </div>

      {/* AI Grading Result Panel */}
      {gradingResult && (
        <div className="bg-white rounded-2xl border-2 border-red-500/50 shadow-xl p-5 sm:p-7 space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-amber-100 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>Kết quả chấm điểm từ Giáo viên Lịch sử AI</span>
              </div>
              <h3 className="text-lg font-black text-stone-900 font-serif">
                Đánh giá bài làm tự luận
              </h3>
            </div>

            {/* Score Pill */}
            <div className="flex items-center gap-3">
              <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 text-white text-center shadow-md shadow-red-900/25">
                <div className="text-[10px] uppercase font-bold tracking-wider text-amber-100">Điểm số</div>
                <div className="text-2xl font-black">{gradingResult.score} / 10</div>
              </div>
            </div>
          </div>

          {/* Teacher's general feedback */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-stone-800 leading-relaxed shadow-2xs">
            <strong className="text-amber-950 block mb-1 font-bold">📝 Nhận xét của giáo viên:</strong>
            {gradingResult.generalFeedback}
          </div>

          {/* Strengths & Missing Points 2-col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Các luận điểm bạn đã đạt:</span>
              </div>
              <ul className="text-xs sm:text-sm space-y-1.5 text-emerald-950">
                {gradingResult.strengths?.length > 0 ? (
                  gradingResult.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-stone-500 italic">Chưa phát hiện luận điểm rõ ràng.</li>
                )}
              </ul>
            </div>

            {/* Missing or Inaccurate */}
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Ý còn thiếu hoặc cần bổ sung:</span>
              </div>
              <ul className="text-xs sm:text-sm space-y-1.5 text-rose-950">
                {gradingResult.missingOrIncorrect?.length > 0 ? (
                  gradingResult.missingOrIncorrect.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-emerald-700 italic font-semibold">Bài làm đã bao quát đầy đủ các ý chính!</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommended Review */}
          {gradingResult.recommendedReview && (
            <div className="p-4 rounded-xl bg-amber-100/60 border border-amber-300 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5">
              <BookOpen className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-900 font-bold mb-0.5">
                  📚 Gợi ý bài học cần ôn lại:
                </strong>
                <span>{gradingResult.recommendedReview}</span>
              </div>
            </div>
          )}

          {/* Sample Solution */}
          {gradingResult.sampleSolution && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <strong className="block text-stone-900 text-xs sm:text-sm font-bold mb-2">
                ✨ Lời giải mẫu tối ưu chuẩn sư phạm để học hỏi:
              </strong>
              <div className="whitespace-pre-line text-xs sm:text-sm text-stone-700 leading-relaxed bg-white p-3.5 rounded-lg border border-stone-200 shadow-2xs font-sans">
                {gradingResult.sampleSolution}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
