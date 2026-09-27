export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple_choice';
  topic: string;
  grade?: string;
  difficulty?: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3
  explanation: string;
  historicalTip?: string;
  historicalContext?: string;
}

export interface TrueFalseStatement {
  id: string;
  text: string;
  isCorrect: boolean; // True or False
  explanation: string;
}

export interface TrueFalseQuestion {
  id: string;
  type: 'true_false';
  topic: string;
  grade?: string;
  difficulty?: Difficulty;
  passage: string; // Historical text / document excerpt
  leadIn?: string;
  statements: TrueFalseStatement[];
  overallExplanation: string;
}

export interface EssayQuestion {
  id: string;
  type: 'essay';
  topic: string;
  grade?: string;
  difficulty?: Difficulty;
  question: string;
  suggestedAnswer: string;
  keyPoints: string[];
  rubric?: string;
  guideNote?: string;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | EssayQuestion;

export interface EssayGradingResult {
  score: number; // e.g. 8.5 / 10
  generalFeedback: string;
  strengths: string[];
  missingOrIncorrect: string[];
  sampleSolution: string;
  recommendedReview: string;
}

export interface RecapCard {
  title: string;
  timeline: string;
  keyTakeaways: string[];
  examTrapsToAvoid: string;
}

export interface SmartAdviceResult {
  overallAssessment: string;
  priorityScore?: string;
  recommendedTopics: Array<{
    topicName: string;
    reason: string;
    urgency?: string;
  }>;
  quickRecapCards: RecapCard[];
  actionPlan: string[];
}

export interface TestAttempt {
  id: string;
  date: string;
  topic: string;
  questionType: QuestionType;
  totalQuestions: number;
  score: number; // e.g., 8.0 / 10
  maxScore: number;
  wrongQuestions: Array<{
    questionText: string;
    topic: string;
    userAnswer?: string;
    correctAnswer?: string;
    explanation?: string;
  }>;
}

export interface ChatImageAttachment {
  url: string; // Base64 data URL for preview: data:image/png;base64,...
  base64Data?: string; // Raw base64 string without data prefix for Gemini API
  mimeType?: string; // e.g. "image/jpeg", "image/png", "image/webp"
  name?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  image?: ChatImageAttachment;
}
