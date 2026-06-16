export interface Subject {
  id: string;
  name: string;
  code: string;
  questionCount: number;
  correctRate: number;
  description: string;
  createdAt: string;
}

export interface KnowledgeNode {
  id: string;
  subjectId: string;
  parentId: string | null;
  title: string;
  level: number;
  questionCount: number;
  children?: KnowledgeNode[];
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'choice' | 'fill' | 'subjective';

export interface Question {
  id: string;
  subjectId: string;
  knowledgePointId: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  content: string;
  options: string[];
  correctAnswer: string;
  analysis: string;
  tags: string[];
  createdAt: string;
}

export type WrongStatus = 'NEW' | 'REVIEWING' | 'MASTERED';

export interface WrongQuestion {
  id: string;
  questionId: string;
  question: Question;
  status: WrongStatus;
  wrongCount: number;
  lastWrongAt: string;
  nextReviewAt: string | null;
  reviewCount: number;
  createdAt: string;
}

export interface ReviewTask {
  id: string;
  wrongQuestionId: string;
  wrongQuestion: WrongQuestion;
  dueDate: string;
  completed: boolean;
  completedAt: string | null;
  result: 'remembered' | 'forgotten' | null;
}

export interface StudyRecord {
  id: string;
  date: string;
  subjectId: string;
  subjectName: string;
  questionsDone: number;
  correctCount: number;
  wrongCount: number;
  duration: number; // minutes
}

export interface DashboardStats {
  totalQuestions: number;
  totalWrong: number;
  todayReview: number;
  todayDone: number;
  weekDone: number;
  masteryRate: number;
}

export interface AnalyticsData {
  dailyTrend: { date: string; done: number; correct: number }[];
  wrongTrend: { date: string; count: number }[];
  subjectAccuracy: { subject: string; accuracy: number }[];
}
