import React, { useState } from 'react';
import { MultipleChoiceQuestion } from '../types/history';
import { CheckCircle2, XCircle, Lightbulb, ChevronRight, ChevronLeft, HelpCircle, RotateCcw, Award } from 'lucide-react';

interface MultipleChoiceViewProps {
  questions: MultipleChoiceQuestion[];
  onFinishQuiz: (results: {
    score: number;
    maxScore: number;
    answers: Record<string, number>;
    wrongQuestions: any[];
  }) => void;
  onReset: () => void;
}

export const MultipleChoiceView: React.FC<MultipleChoiceViewProps> = ({
  questions,
  onFinishQuiz,
  onReset,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  const selectedAnswer = answers[currentQ?.id];
  const hasAnswered = selectedAnswer !== undefined;
  const isCorrect = hasAnswered && selectedAnswer === currentQ.correctAnswer;

  const handleSelectOption = (index: number) => {
    if (isCompleted) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: index }));
    // Auto show explanation after choosing
    setShowExplanation((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    let correctCount = 0;
    const wrongQuestions: any[] = [];

    questions.forEach((q) => {
      const ans = answers[q.id];
      if (ans === q.correctAnswer) {
        correctCount += 1;
      } else {
        wrongQuestions.push({
          questionText: q.question,
          topic: q.topic,
          userAnswer: ans !== undefined ? q.options[ans] : 'Chưa trả lời',
          correctAnswer: q.options[q.correctAnswer],
          explanation: q.explanation,
        });
      }
    });

    const score = Number(((correctCount / total) * 10).toFixed(2));
    setIsCompleted(true);
    onFinishQuiz({
      score,
      maxScore: 10,
      answers,
      wrongQuestions,
    });
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Top Header & Progress */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 mb-4">
        <div className="flex items-center justify-between mb-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 px-2.5 py-1 rounded-md bg-stone-100">
              Câu {currentIndex + 1}/{total}
            </span>
            <span className="text-stone-500 font-medium truncate max-w-[200px] sm:max-w-[340px]">
              {currentQ.topic}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-amber-700">
            <span>Tiến độ: {progressPercent}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 h-2.5 transition-all duration-300 rounded-full shadow-2xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question fast jump bullets */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-amber-100 overflow-x-auto scrollbar-none">
          {questions.map((q, idx) => {
            const answered = answers[q.id] !== undefined;
            const correct = answered && answers[q.id] === q.correctAnswer;
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  isCurrent
                    ? 'ring-2 ring-red-600 bg-gradient-to-tr from-red-700 to-amber-600 text-white shadow-xs'
                    : answered
                    ? correct
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 sm:p-7 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-relaxed mb-6 font-sans">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isThisOptionCorrect = idx === currentQ.correctAnswer;

            let optionStyle = 'border-stone-200 hover:border-amber-400 bg-white hover:bg-amber-50/20 text-stone-800';
            let badgeStyle = 'bg-stone-100 text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-800';

            if (hasAnswered) {
              if (isThisOptionCorrect) {
                optionStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium ring-1 ring-emerald-500/30';
                badgeStyle = 'bg-emerald-600 text-white font-bold';
              } else if (isSelected && !isThisOptionCorrect) {
                optionStyle = 'border-red-500 bg-red-50/70 text-red-950 font-medium ring-1 ring-red-500/30';
                badgeStyle = 'bg-red-600 text-white font-bold';
              } else {
                optionStyle = 'border-stone-200 bg-stone-50/50 text-stone-400 opacity-80';
                badgeStyle = 'bg-stone-100 text-stone-400';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${optionStyle}`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${badgeStyle}`}
                >
                  {optionLabels[idx]}
                </span>
                <span className="text-sm sm:text-base pt-0.5 flex-1 leading-snug">
                  {opt}
                </span>

                {hasAnswered && isThisOptionCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {hasAnswered && isSelected && !isThisOptionCorrect && (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation Accordion / Section */}
        {hasAnswered && (
          <div
            className={`rounded-xl p-4 sm:p-5 border transition-all ${
              isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Chính xác! (+1 điểm)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-800 font-bold text-sm">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Chưa chính xác! Đáp án đúng là {optionLabels[currentQ.correctAnswer]}</span>
                </div>
              )}
            </div>

            <div className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-3">
              <strong className="text-stone-900 block mb-1">💡 Giải thích chi tiết từ giáo viên:</strong>
              {currentQ.explanation}
            </div>

            {currentQ.historicalTip && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/80 border border-amber-200/60 text-xs text-amber-900 font-medium">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Mẹo nhớ Sử:</strong> {currentQ.historicalTip}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium transition-all disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        <div className="flex items-center gap-2">
          {currentIndex < total - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-600/20 active:scale-95"
            >
              <span>Câu tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-900/10"
            >
              <Award className="w-4 h-4" />
              <span>Hoàn thành & Xem điểm</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
