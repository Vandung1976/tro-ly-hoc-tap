import React, { useState } from 'react';
import { TrueFalseQuestion } from '../types/history';
import {
  Check,
  X,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Award,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  CheckCheck,
} from 'lucide-react';

interface TrueFalseViewProps {
  questions: TrueFalseQuestion[];
  onFinishQuiz: (results: {
    score: number;
    maxScore: number;
    answers: Record<string, Record<string, boolean>>;
    wrongQuestions: any[];
  }) => void;
  onReset: () => void;
}

export const TrueFalseView: React.FC<TrueFalseViewProps> = ({
  questions,
  onFinishQuiz,
  onReset,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // answers: { [questionId]: { [statementId]: boolean } }
  const [answers, setAnswers] = useState<Record<string, Record<string, boolean>>>({});
  // Track which statements have had their explanation expanded / revealed
  const [revealedStatements, setRevealedStatements] = useState<Record<string, boolean>>({});
  // Entire question revealed
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});
  // Toggle instant feedback mode (default: true for optimal learning)
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const currentAnswers = answers[currentQ?.id] || {};
  const answeredCount = currentQ.statements.filter((s) => currentAnswers[s.id] !== undefined).length;
  const isQuestionFullyAnswered = answeredCount === currentQ.statements.length;
  const isWholeQuestionRevealed = !!revealedQuestions[currentQ?.id];

  // Calculate score for current question according to MOET GDPT 2018 guidelines
  const calculateQuestionScore = (q: TrueFalseQuestion) => {
    const qAnswers = answers[q.id] || {};
    let correctCount = 0;
    q.statements.forEach((s) => {
      if (qAnswers[s.id] !== undefined && qAnswers[s.id] === s.isCorrect) {
        correctCount += 1;
      }
    });

    if (correctCount === 4) return 1.0;
    if (correctCount === 3) return 0.5;
    if (correctCount === 2) return 0.25;
    if (correctCount === 1) return 0.1;
    return 0;
  };

  const getCorrectCountForQuestion = (q: TrueFalseQuestion) => {
    const qAnswers = answers[q.id] || {};
    let count = 0;
    q.statements.forEach((s) => {
      if (qAnswers[s.id] !== undefined && qAnswers[s.id] === s.isCorrect) {
        count += 1;
      }
    });
    return count;
  };

  // Handler when student clicks "Đúng" or "Sai" for a statement
  const handleSelect = (statementId: string, value: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...(prev[currentQ.id] || {}),
        [statementId]: value,
      },
    }));

    // If instant feedback is enabled, immediately reveal this statement's result
    if (instantFeedback) {
      setRevealedStatements((prev) => ({
        ...prev,
        [`${currentQ.id}_${statementId}`]: true,
      }));
    }
  };

  // Toggle reveal for individual statement
  const toggleStatementReveal = (statementId: string) => {
    const key = `${currentQ.id}_${statementId}`;
    setRevealedStatements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Reveal all 4 statements for this question
  const handleCheckWholeQuestion = () => {
    setRevealedQuestions((prev) => ({ ...prev, [currentQ.id]: true }));
    // Also reveal all statement explanations
    const newRevealed = { ...revealedStatements };
    currentQ.statements.forEach((s) => {
      newRevealed[`${currentQ.id}_${s.id}`] = true;
    });
    setRevealedStatements(newRevealed);
  };

  // Reset this question's answers
  const handleResetCurrentQuestion = () => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
    setRevealedQuestions((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
    const newRevealed = { ...revealedStatements };
    currentQ.statements.forEach((s) => {
      delete newRevealed[`${currentQ.id}_${s.id}`];
    });
    setRevealedStatements(newRevealed);
  };

  const handleFinish = () => {
    let totalScore = 0;
    const maxScore = total * 1.0;
    const wrongQuestions: any[] = [];

    questions.forEach((q) => {
      const qScore = calculateQuestionScore(q);
      totalScore += qScore;

      const qAns = answers[q.id] || {};
      const wrongStatements = q.statements.filter((s) => qAns[s.id] !== s.isCorrect);

      if (wrongStatements.length > 0) {
        wrongQuestions.push({
          questionText: q.passage.slice(0, 120) + '...',
          topic: q.topic,
          userAnswer: `${4 - wrongStatements.length}/4 ý đúng`,
          correctAnswer: '4/4 ý đúng',
          explanation: q.overallExplanation,
        });
      }
    });

    const normalizedScore = Number(((totalScore / maxScore) * 10).toFixed(2));

    onFinishQuiz({
      score: normalizedScore,
      maxScore: 10,
      answers,
      wrongQuestions,
    });
  };

  const letters = ['a', 'b', 'c', 'd'];
  const curScore = calculateQuestionScore(currentQ);
  const curCorrectCount = getCorrectCountForQuestion(currentQ);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Top Header & Progress */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-950 px-3 py-1 rounded-xl bg-amber-100 border border-amber-200">
              Câu {currentIndex + 1}/{total} • Trắc nghiệm Đúng / Sai
            </span>
            <span className="text-stone-600 font-bold truncate max-w-[200px] sm:max-w-[340px]">
              {currentQ.topic}
            </span>
          </div>

          {/* Feedback mode toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setInstantFeedback(!instantFeedback)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                instantFeedback
                  ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-2xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
              title="Bật/Tắt chế độ hiện kết quả và giải thích ngay khi bạn click chọn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{instantFeedback ? 'Báo kết quả ngay: BẬT' : 'Báo kết quả ngay: TẮT'}</span>
            </button>
          </div>
        </div>

        {/* Scoring Scale Guide Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-stone-50 via-amber-50/50 to-stone-50 border border-amber-200/80 text-[11px] text-stone-700">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950">
            <Layers className="w-3.5 h-3.5 text-amber-700" />
            <span>Thang điểm GDPT 2018:</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 font-medium">
            <span>1 ý = <strong className="text-stone-900">0.10đ</strong></span>
            <span>•</span>
            <span>2 ý = <strong className="text-stone-900">0.25đ</strong></span>
            <span>•</span>
            <span>3 ý = <strong className="text-stone-900">0.50đ</strong></span>
            <span>•</span>
            <span>4 ý = <strong className="text-emerald-700 font-bold">1.00đ</strong></span>
          </div>
        </div>

        {/* Question Switcher Tabs */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-amber-100 overflow-x-auto scrollbar-none">
          {questions.map((q, idx) => {
            const qAns = answers[q.id] || {};
            const qAnsweredCount = q.statements.filter((s) => qAns[s.id] !== undefined).length;
            const isCur = idx === currentIndex;
            const isFull = qAnsweredCount === q.statements.length;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isCur
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs'
                    : isFull
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : qAnsweredCount > 0
                    ? 'bg-amber-100 text-amber-950 border border-amber-300'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Câu {idx + 1} {isFull ? '✓' : qAnsweredCount > 0 ? `(${qAnsweredCount}/4)` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Historical Document Passage Card */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-red-50/50 rounded-2xl border-2 border-amber-300/80 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-red-900 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-red-600" />
            <span>Tư liệu lịch sử nguồn (Đọc kỹ đoạn trích)</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-900 border border-red-200">
            {currentQ.difficulty === 'hard' ? 'Vận dụng' : 'Thông hiểu'}
          </span>
        </div>

        <blockquote className="text-xs sm:text-sm text-stone-800 leading-relaxed pl-3.5 border-l-4 border-red-600 bg-white/95 p-3.5 rounded-r-xl shadow-2xs font-serif italic">
          "{currentQ.passage}"
        </blockquote>

        <p className="text-xs sm:text-[13px] text-stone-700 mt-3 font-semibold">
          {currentQ.leadIn || 'Dựa vào đoạn tư liệu trên và kiến thức lịch sử đã học, hãy xác định tính Đúng hoặc Sai của mỗi mệnh đề sau:'}
        </p>
      </div>

      {/* Real-time Question Score Tracker Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-amber-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-600">Tiến độ câu hiện tại:</span>
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-stone-100 text-stone-900">
            {answeredCount}/4 mệnh đề
          </span>
        </div>

        <div className="flex items-center gap-3">
          {answeredCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
              <span>Đúng:</span>
              <span className="text-emerald-700 font-black">{curCorrectCount}/4 ý</span>
              <span>➔ Điểm:</span>
              <span className="text-red-700 font-black">{curScore} đ</span>
            </div>
          )}

          {answeredCount > 0 && (
            <button
              type="button"
              onClick={handleResetCurrentQuestion}
              className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-red-700 font-semibold px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
              title="Xóa làm lại 4 ý của câu này"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Làm lại</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Statements (a, b, c, d) - Rich Interactive Cards */}
      <div className="space-y-3.5">
        {currentQ.statements.map((stmt, idx) => {
          const userVal = currentAnswers[stmt.id];
          const isAnswered = userVal !== undefined;
          const isCorrectChoice = isAnswered && userVal === stmt.isCorrect;
          const isStatementRevealed = isWholeQuestionRevealed || (isAnswered && !!revealedStatements[`${currentQ.id}_${stmt.id}`]);

          return (
            <div
              key={stmt.id}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                isStatementRevealed
                  ? isCorrectChoice
                    ? 'bg-gradient-to-br from-emerald-50/90 to-white border-emerald-400 shadow-sm'
                    : 'bg-gradient-to-br from-rose-50/90 to-white border-rose-400 shadow-sm'
                  : isAnswered
                  ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-amber-300 shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                {/* Statement text with letter badge */}
                <div className="flex items-start gap-3 flex-1">
                  <span
                    className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs transition-colors ${
                      isStatementRevealed
                        ? isCorrectChoice
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                        : isAnswered
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100 text-amber-950 border border-amber-300'
                    }`}
                  >
                    {letters[idx]}
                  </span>

                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-stone-900 leading-relaxed font-semibold">
                      {stmt.text}
                    </p>

                    {/* Quick status text below statement when answered */}
                    {isAnswered && !isStatementRevealed && (
                      <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                        <span>Bạn đang chọn:</span>
                        <span className={userVal === true ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                          {userVal === true ? 'ĐÚNG' : 'SAI'}
                        </span>
                        <span className="text-stone-400">• Bấm kiểm tra hoặc bật báo kết quả ngay để xem đáp án</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Big, Clear & Vivid TRUE / FALSE Selection Buttons */}
                <div className="flex items-center gap-2.5 self-end sm:self-start shrink-0">
                  {/* BUTTON ĐÚNG */}
                  <button
                    type="button"
                    onClick={() => handleSelect(stmt.id, true)}
                    className={`group flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer select-none active:scale-95 ${
                      userVal === true
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-2 border-emerald-700 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/30'
                        : 'bg-white border-2 border-emerald-300 hover:border-emerald-500 text-emerald-800 hover:bg-emerald-50/70 shadow-2xs'
                    }`}
                  >
                    <Check
                      className={`w-4 h-4 stroke-[3] transition-transform group-hover:scale-110 ${
                        userVal === true ? 'text-white' : 'text-emerald-600'
                      }`}
                    />
                    <span>ĐÚNG</span>
                  </button>

                  {/* BUTTON SAI */}
                  <button
                    type="button"
                    onClick={() => handleSelect(stmt.id, false)}
                    className={`group flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer select-none active:scale-95 ${
                      userVal === false
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-2 border-rose-700 shadow-md shadow-rose-600/30 ring-2 ring-rose-500/30'
                        : 'bg-white border-2 border-rose-300 hover:border-rose-500 text-rose-800 hover:bg-rose-50/70 shadow-2xs'
                    }`}
                  >
                    <X
                      className={`w-4 h-4 stroke-[3] transition-transform group-hover:scale-110 ${
                        userVal === false ? 'text-white' : 'text-rose-600'
                      }`}
                    />
                    <span>SAI</span>
                  </button>
                </div>
              </div>

              {/* Reveal explanation box for this statement */}
              {isStatementRevealed && (
                <div
                  className={`mt-3.5 pt-3 border-t text-xs sm:text-sm rounded-xl p-3 animate-in fade-in duration-200 ${
                    isCorrectChoice
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
                      : 'bg-rose-100/70 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 font-black text-xs sm:text-[13px]">
                      {isCorrectChoice ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="text-emerald-900">
                            Chính xác! Bạn đã chọn: {userVal ? 'ĐÚNG' : 'SAI'}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                          <span className="text-rose-900">
                            Chưa đúng! Bạn chọn {userVal ? 'ĐÚNG' : 'SAI'} — Đáp án chuẩn là{' '}
                            <strong className="underline uppercase">{stmt.isCorrect ? 'ĐÚNG' : 'SAI'}</strong>
                          </span>
                        </>
                      )}
                    </div>

                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/80 border text-stone-700">
                      Mệnh đề {letters[idx]}
                    </span>
                  </div>

                  <div className="leading-relaxed text-stone-800 mt-1 pl-5 font-sans">
                    <strong>Giải thích chi tiết:</strong> {stmt.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Action / Whole Question Explanation Panel */}
      <div className="space-y-3 pt-2">
        {!isWholeQuestionRevealed ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
            <div className="text-xs text-stone-600">
              {isQuestionFullyAnswered ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCheck className="w-4 h-4" />
                  Bạn đã trả lời đủ cả 4 mệnh đề. Bấm để xem tổng kết toàn câu!
                </span>
              ) : (
                <span>Hãy chọn <strong>Đúng</strong> hoặc <strong>Sai</strong> cho cả 4 mệnh đề (a, b, c, d) phía trên.</span>
              )}
            </div>

            <button
              onClick={handleCheckWholeQuestion}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
            >
              Kiểm tra & Xem giải thích toàn câu
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 text-xs sm:text-sm text-amber-950 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <strong className="text-red-950 font-black text-sm sm:text-base font-serif flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Tổng kết kết quả câu hỏi {currentIndex + 1}:</span>
              </strong>
              <span className="font-black text-xs px-3 py-1 rounded-full bg-red-600 text-white shadow-xs">
                {curCorrectCount}/4 ý đúng • {curScore} / 1.0 điểm
              </span>
            </div>

            <p className="text-stone-800 leading-relaxed font-sans pt-1">
              <strong>Nhận định lịch sử:</strong> {currentQ.overallExplanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-bold transition-all disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        <div className="flex items-center gap-2">
          {currentIndex < total - 1 ? (
            <button
              onClick={() => setCurrentIndex((p) => p + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
            >
              <span>Câu tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-emerald-900/20 active:scale-95 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Nộp bài & Xem bảng điểm</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
