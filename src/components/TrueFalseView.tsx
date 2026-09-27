import React, { useState } from 'react';
import { TrueFalseQuestion } from '../types/history';
import { Check, X, BookOpen, AlertCircle, ChevronRight, ChevronLeft, Award, HelpCircle } from 'lucide-react';

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
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const currentAnswers = answers[currentQ?.id] || {};
  const isQuestionAnswered = currentQ.statements.every((s) => currentAnswers[s.id] !== undefined);
  const isQuestionRevealed = !!showResults[currentQ?.id];

  const handleSelect = (statementId: string, value: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...(prev[currentQ.id] || {}),
        [statementId]: value,
      },
    }));
  };

  const handleCheckAnswer = () => {
    setShowResults((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  const calculateQuestionScore = (q: TrueFalseQuestion) => {
    const qAnswers = answers[q.id] || {};
    let correctCount = 0;
    q.statements.forEach((s) => {
      if (qAnswers[s.id] === s.isCorrect) {
        correctCount += 1;
      }
    });

    // Official GDPT scoring rule for True/False:
    // 1 đúng = 0.1đ | 2 đúng = 0.25đ | 3 đúng = 0.5đ | 4 đúng = 1.0đ
    if (correctCount === 4) return 1.0;
    if (correctCount === 3) return 0.5;
    if (correctCount === 2) return 0.25;
    if (correctCount === 1) return 0.1;
    return 0;
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

    // Normalize score to scale 10
    const normalizedScore = Number(((totalScore / maxScore) * 10).toFixed(2));

    onFinishQuiz({
      score: normalizedScore,
      maxScore: 10,
      answers,
      wrongQuestions,
    });
  };

  const letters = ['a', 'b', 'c', 'd'];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Top Header & Progress */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 mb-4">
        <div className="flex items-center justify-between mb-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-900 px-2.5 py-1 rounded-md bg-amber-100">
              Câu {currentIndex + 1}/{total} (Đúng / Sai)
            </span>
            <span className="text-stone-500 font-medium truncate max-w-[200px] sm:max-w-[340px]">
              {currentQ.topic}
            </span>
          </div>

          <div className="text-xs font-semibold text-stone-600">
            Thang điểm GDPT: 1 ý = 0.1đ | 2 ý = 0.25đ | 3 ý = 0.5đ | 4 ý = 1đ
          </div>
        </div>

        {/* Question Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-amber-100">
          {questions.map((q, idx) => {
            const hasAns = q.statements.every((s) => (answers[q.id] || {})[s.id] !== undefined);
            const isCur = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isCur
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs'
                    : hasAns
                    ? 'bg-amber-100 text-amber-950 border border-amber-300'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Câu {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Historical Document Passage Card */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-red-50/50 rounded-2xl border border-amber-300/80 shadow-xs p-5 sm:p-6 mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-red-900 uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4 text-red-600" />
          <span>Tư liệu lịch sử trích đoạn</span>
        </div>
        <blockquote className="text-sm sm:text-base text-stone-800 italic leading-relaxed pl-3 border-l-4 border-red-600 bg-white/90 p-3.5 rounded-r-xl shadow-2xs">
          "{currentQ.passage}"
        </blockquote>
        <p className="text-xs text-stone-600 mt-3 font-medium">
          {currentQ.leadIn || 'Dựa vào đoạn tư liệu trên và kiến thức đã học, hãy xác định tính Đúng hoặc Sai của mỗi mệnh đề:'}
        </p>
      </div>

      {/* 4 Statements (a, b, c, d) */}
      <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 sm:p-6 mb-4 space-y-4">
        {currentQ.statements.map((stmt, idx) => {
          const userVal = currentAnswers[stmt.id];
          const isAnswered = userVal !== undefined;
          const isCorrectChoice = isAnswered && userVal === stmt.isCorrect;

          return (
            <div
              key={stmt.id}
              className={`p-4 rounded-xl border transition-all ${
                isQuestionRevealed
                  ? isCorrectChoice
                    ? 'bg-emerald-50/80 border-emerald-300'
                    : 'bg-red-50/80 border-red-300'
                  : 'bg-stone-50/60 border-stone-200 hover:border-amber-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2.5 flex-1">
                  <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {letters[idx]}
                  </span>
                  <span className="text-xs sm:text-sm text-stone-900 leading-relaxed font-medium">
                    {stmt.text}
                  </span>
                </div>

                {/* Right: True / False Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelect(stmt.id, true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      userVal === true
                        ? isQuestionRevealed
                          ? stmt.isCorrect
                            ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                            : 'bg-red-600 text-white shadow-red-600/30'
                          : 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-red-600/25'
                        : 'bg-white border border-stone-300 text-stone-700 hover:border-amber-400 hover:text-red-700'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Đúng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelect(stmt.id, false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      userVal === false
                        ? isQuestionRevealed
                          ? !stmt.isCorrect
                            ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                            : 'bg-red-600 text-white shadow-red-600/30'
                          : 'bg-stone-800 text-white shadow-stone-800/25'
                        : 'bg-white border border-stone-300 text-stone-700 hover:border-amber-400 hover:text-red-700'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Sai</span>
                  </button>
                </div>
              </div>

              {/* Reveal explanation for this statement */}
              {isQuestionRevealed && (
                <div className="mt-2.5 pt-2.5 border-t border-amber-200/60 text-xs text-stone-800 flex items-start gap-1.5">
                  <div className="font-bold text-stone-900 shrink-0">
                    Đáp án chuẩn: <span className={stmt.isCorrect ? 'text-emerald-700 font-extrabold' : 'text-red-700 font-extrabold'}>{stmt.isCorrect ? 'ĐÚNG' : 'SAI'}</span> -
                  </div>
                  <div className="leading-relaxed">{stmt.explanation}</div>
                </div>
              )}
            </div>
          );
        })}

        {/* Check Answer Button for this specific question */}
        {!isQuestionRevealed ? (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleCheckAnswer}
              disabled={!isQuestionAnswered}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-600/20 disabled:opacity-40 active:scale-95"
            >
              Kiểm tra đáp án câu này
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-xs text-amber-950 shadow-2xs">
            <strong className="text-red-950 font-bold text-sm">Điểm câu này:</strong> {calculateQuestionScore(currentQ)} / 1.0 điểm.
            <div className="mt-1.5 text-stone-700 leading-relaxed">{currentQ.overallExplanation}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold transition-all disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        <div className="flex items-center gap-2">
          {currentIndex < total - 1 ? (
            <button
              onClick={() => setCurrentIndex((p) => p + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-600/20 active:scale-95"
            >
              <span>Câu tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-900/20 active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>Hoàn thành & Xem tổng kết</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
