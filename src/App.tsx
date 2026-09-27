import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { QuizModeSelector } from './components/QuizModeSelector';
import { MultipleChoiceView } from './components/MultipleChoiceView';
import { TrueFalseView } from './components/TrueFalseView';
import { EssayView } from './components/EssayView';
import { SmartAdviceView } from './components/SmartAdviceView';
import { TutorChatView } from './components/TutorChatView';
import { HistoryLogView } from './components/HistoryLogView';
import { ScoreModal } from './components/ScoreModal';
import {
  QuestionType,
  Difficulty,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  TestAttempt,
} from './types/history';
import {
  SAMPLE_MULTIPLE_CHOICE,
  SAMPLE_TRUE_FALSE,
  SAMPLE_TOPICS,
} from './data/sampleQuestions';
import { BookOpen, Sparkles, Award, ArrowLeft, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'su_viet_history_records_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tutor');
  const [historyRecords, setHistoryRecords] = useState<TestAttempt[]>([]);

  // Current Quiz States
  const [currentQuizType, setCurrentQuizType] = useState<QuestionType | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [mcQuestions, setMcQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [tfQuestions, setTfQuestions] = useState<TrueFalseQuestion[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);

  // Result Modal State
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<{
    score: number;
    maxScore: number;
    topic: string;
    totalQuestions: number;
    wrongQuestions: any[];
  } | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistoryRecords(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading history from localStorage', e);
    }
  }, []);

  // Save to LocalStorage
  const saveHistoryRecord = (record: TestAttempt) => {
    setHistoryRecords((prev) => {
      const updated = [record, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving history to localStorage', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistoryRecords([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Average score
  const totalScore = historyRecords.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const averageScore = historyRecords.length > 0 ? totalScore / historyRecords.length : 0;

  // Start Quiz handler (from QuizModeSelector)
  const handleStartQuiz = async ({
    topic,
    questionType,
    difficulty,
    count,
    useAI,
  }: {
    topic: string;
    questionType: QuestionType;
    difficulty: Difficulty;
    count: number;
    useAI: boolean;
  }) => {
    setCurrentTopic(topic);
    setCurrentQuizType(questionType);

    if (!useAI) {
      // Use verified offline/curated bank
      if (questionType === 'multiple_choice') {
        // Filter or use sample
        const filtered = SAMPLE_MULTIPLE_CHOICE.filter(
          (q) => q.topic.toLowerCase().includes(topic.toLowerCase()) || topic.includes('Tổng hợp')
        );
        setMcQuestions(filtered.length > 0 ? filtered : SAMPLE_MULTIPLE_CHOICE);
      } else if (questionType === 'true_false') {
        const filtered = SAMPLE_TRUE_FALSE.filter(
          (q) => q.topic.toLowerCase().includes(topic.toLowerCase()) || topic.includes('Tổng hợp')
        );
        setTfQuestions(filtered.length > 0 ? filtered : SAMPLE_TRUE_FALSE);
      }
      return;
    }

    // AI Generation
    setIsLoadingQuiz(true);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          questionType,
          difficulty,
          count,
        }),
      });

      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        if (questionType === 'multiple_choice') {
          setMcQuestions(data.questions);
        } else if (questionType === 'true_false') {
          setTfQuestions(data.questions);
        }
      } else {
        console.warn('API returned fallback or incomplete questions');
        const filtered = SAMPLE_MULTIPLE_CHOICE.filter((q) => q.topic === topic);
        if (questionType === 'multiple_choice') {
          setMcQuestions(filtered.length > 0 ? filtered : SAMPLE_MULTIPLE_CHOICE);
        } else {
          const filteredTf = SAMPLE_TRUE_FALSE.filter((q) => q.topic === topic);
          setTfQuestions(filteredTf.length > 0 ? filteredTf : SAMPLE_TRUE_FALSE);
        }
      }
    } catch (err) {
      console.warn('Network issue generating questions, loading local exam questions bank:', err);
      const filtered = SAMPLE_MULTIPLE_CHOICE.filter((q) => q.topic === topic);
      if (questionType === 'multiple_choice') {
        setMcQuestions(filtered.length > 0 ? filtered : SAMPLE_MULTIPLE_CHOICE);
      } else {
        const filteredTf = SAMPLE_TRUE_FALSE.filter((q) => q.topic === topic);
        setTfQuestions(filteredTf.length > 0 ? filteredTf : SAMPLE_TRUE_FALSE);
      }
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Finish quiz handler
  const handleFinishMultipleChoice = (res: {
    score: number;
    maxScore: number;
    answers: Record<string, number>;
    wrongQuestions: any[];
  }) => {
    const attempt: TestAttempt = {
      id: `att-${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      topic: currentTopic,
      questionType: 'multiple_choice',
      totalQuestions: mcQuestions.length,
      score: res.score,
      maxScore: res.maxScore,
      wrongQuestions: res.wrongQuestions,
    };

    saveHistoryRecord(attempt);
    setLastResult({
      score: res.score,
      maxScore: res.maxScore,
      topic: currentTopic,
      totalQuestions: mcQuestions.length,
      wrongQuestions: res.wrongQuestions,
    });
    setShowScoreModal(true);
  };

  const handleFinishTrueFalse = (res: {
    score: number;
    maxScore: number;
    answers: Record<string, Record<string, boolean>>;
    wrongQuestions: any[];
  }) => {
    const attempt: TestAttempt = {
      id: `att-${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      topic: currentTopic,
      questionType: 'true_false',
      totalQuestions: tfQuestions.length,
      score: res.score,
      maxScore: res.maxScore,
      wrongQuestions: res.wrongQuestions,
    };

    saveHistoryRecord(attempt);
    setLastResult({
      score: res.score,
      maxScore: res.maxScore,
      topic: currentTopic,
      totalQuestions: tfQuestions.length,
      wrongQuestions: res.wrongQuestions,
    });
    setShowScoreModal(true);
  };

  // Save essay attempt
  const handleSaveEssayAttempt = (data: {
    topic: string;
    question: string;
    score: number;
    feedback: string;
    missingPoints: string[];
    recommendedReview: string;
  }) => {
    const attempt: TestAttempt = {
      id: `att-essay-${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      topic: data.topic,
      questionType: 'essay',
      totalQuestions: 1,
      score: data.score,
      maxScore: 10,
      wrongQuestions:
        data.missingPoints.length > 0
          ? [
              {
                questionText: data.question,
                topic: data.topic,
                userAnswer: 'Thiếu một số ý trọng tâm',
                correctAnswer: data.missingPoints.join('; '),
                explanation: data.feedback,
              },
            ]
          : [],
    };

    saveHistoryRecord(attempt);
  };

  // Retake topic from advice or history
  const handleSelectTopicToPractice = (topic: string) => {
    setCurrentTopic(topic);
    setActiveTab('quiz');
    setCurrentQuizType('multiple_choice');
    // Start quiz with that topic using AI or filtered sample
    handleStartQuiz({
      topic,
      questionType: 'multiple_choice',
      difficulty: 'medium',
      count: 5,
      useAI: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-stone-50/40 to-orange-50/30 text-stone-900 font-sans flex flex-col selection:bg-red-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // If moving away from in-progress quiz, reset quiz view if wanted
        }}
        completedTestsCount={historyRecords.length}
        averageScore={averageScore}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tab 1: Quiz (Multiple Choice & True/False) */}
        {activeTab === 'quiz' && (
          <div>
            {!currentQuizType ? (
              <QuizModeSelector
                onStartQuiz={handleStartQuiz}
                isLoading={isLoadingQuiz}
              />
            ) : (
              <div>
                {/* Back to selector bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-red-50/80 border border-amber-200/90 shadow-xs">
                  <button
                    onClick={() => setCurrentQuizType(null)}
                    className="group inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-800 hover:via-red-700 hover:to-amber-700 text-white font-black text-xs sm:text-sm shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-900/40 active:scale-95 transition-all border border-amber-300/40 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-yellow-300 stroke-[3] group-hover:-translate-x-1 transition-transform" />
                    <span className="tracking-wide">Chọn chuyên đề khác</span>
                  </button>

                  <div className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/95 border border-amber-300/80 text-amber-950 shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>
                      Chế độ:{' '}
                      <strong className="text-red-900 font-black">
                        {currentQuizType === 'multiple_choice'
                          ? 'Trắc nghiệm 4 lựa chọn'
                          : 'Trắc nghiệm Đúng / Sai'}
                      </strong>
                    </span>
                  </div>
                </div>

                {isLoadingQuiz ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3 shadow-xs">
                    <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                    <h3 className="font-bold text-stone-800 text-base">
                      Trợ lý AI đang soạn đề thi Lịch sử...
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Đang tra cứu tư liệu, đối chiếu mốc thời gian và biên soạn các câu hỏi kèm giải thích chi tiết.
                    </p>
                  </div>
                ) : currentQuizType === 'multiple_choice' ? (
                  <MultipleChoiceView
                    questions={mcQuestions}
                    onFinishQuiz={handleFinishMultipleChoice}
                    onReset={() => setCurrentQuizType(null)}
                  />
                ) : (
                  <TrueFalseView
                    questions={tfQuestions}
                    onFinishQuiz={handleFinishTrueFalse}
                    onReset={() => setCurrentQuizType(null)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Essay & AI Grading */}
        {activeTab === 'essay' && (
          <EssayView onSaveEssayAttempt={handleSaveEssayAttempt} />
        )}

        {/* Tab 3: Smart Advice & Weak Points Recap */}
        {activeTab === 'advice' && (
          <SmartAdviceView
            historyRecords={historyRecords}
            onSelectTopicToPractice={handleSelectTopicToPractice}
          />
        )}

        {/* Tab 1 (Default): AI History Tutor Chat */}
        {activeTab === 'tutor' && (
          <TutorChatView
            onSwitchToQuiz={() => setActiveTab('quiz')}
            onSwitchToEssay={() => setActiveTab('essay')}
          />
        )}

        {/* Tab 5: Practice History */}
        {activeTab === 'history' && (
          <HistoryLogView
            historyRecords={historyRecords}
            onClearHistory={handleClearHistory}
            onRetakeTopic={handleSelectTopicToPractice}
          />
        )}
      </main>

      {/* Score Modal */}
      {showScoreModal && lastResult && (
        <ScoreModal
          score={lastResult.score}
          maxScore={lastResult.maxScore}
          topic={lastResult.topic}
          totalQuestions={lastResult.totalQuestions}
          wrongQuestions={lastResult.wrongQuestions}
          onRetry={() => {
            setShowScoreModal(false);
            // restart same quiz
          }}
          onGoToAdvice={() => {
            setShowScoreModal(false);
            setActiveTab('advice');
          }}
          onGoToTutor={() => {
            setShowScoreModal(false);
            setActiveTab('tutor');
          }}
          onClose={() => setShowScoreModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 font-serif">Sử Việt THPT</span>
            <span>— Trợ lý ôn thi Lịch sử thông minh</span>
          </div>
          <div>Bám sát chuẩn kiến thức & định dạng đề thi tốt nghiệp THPT mới</div>
        </div>
      </footer>
    </div>
  );
}
