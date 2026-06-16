/* =================================================================
   考研工作台 · 核心数据类型
   ================================================================= */

// ========== 错误原因枚举 ==========
export enum ErrorReason {
  CONCEPT_UNCLEAR = '概念不清',
  CARELESS = '粗心大意',
  METHOD_WRONG = '方法不对',
  TIME_INSUFFICIENT = '时间不够',
  OTHER = '其他',
}

// ========== 题型枚举 ==========
export type QuestionType = 'choice' | 'fill' | 'subjective';

// ========== 科目配置 ==========
export interface Chapter {
  id: string;
  name: string;
  knowledgePoints: string[];
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

// ========== 作答记录 ==========
export interface Attempt {
  attemptId: string;
  date: string;          // ISO datetime
  timeSpent: number;     // 秒
  userAnswer: string;
  correct: boolean;
  confidence: 1 | 2 | 3 | 4 | 5;
}

// ========== 艾宾浩斯复习轮次 ==========
export interface ReviewRound {
  round: number;         // 1, 3, 7, 15
  dueDate: string;       // ISO date
  reviewed: boolean;
  reviewedAt?: string;
  result?: 'remember' | 'forgot';
}

export interface ReviewSchedule {
  currentRound: number;
  rounds: ReviewRound[];
  nextReviewAt: string | null;
}

// ========== 错题（核心实体） ==========
export interface Mistake {
  id: string;
  subjectId: string;
  chapterId: string;
  knowledgePoint: string;
  errorReason: ErrorReason;
  questionType: QuestionType;

  question: string;
  options: string[];
  correctAnswer: string;
  analysis: string;

  tags: string[];
  importance: 1 | 2 | 3;

  createdAt: string;
  updatedAt: string;

  reviewSchedule: ReviewSchedule;
  attempts: Attempt[];
}

// ========== 今日 Flag ==========
export interface DailyFlag {
  id: string;
  content: string;
  date: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

// ========== 模考题目 ==========
export interface ExamQuestion {
  index: number;
  content: string;
  options: string[];
  selectedOption: string | null;
  correctOption: string;
  correct: boolean;
  score: number;
}

// ========== 模考记录 ==========
export interface ExamRecord {
  id: string;
  moduleName: string;
  date: string;
  timeLimit: number;
  timeSpent: number;
  questions: ExamQuestion[];
  totalScore: number;
  earnedScore: number;
}

// ========== 设置 ==========
export interface Settings {
  examDate: string;
  dailyGoalHours: number;
  targetSchool: string;
  targetMajor: string;
  whiteNoiseVolume: number;
}

// ========== 根数据 ==========
export interface ExamDashboardData {
  settings: Settings;
  subjects: Subject[];
  mistakes: Mistake[];
  dailyFlags: DailyFlag[];
  examRecords: ExamRecord[];
  lastReviewCheck: string;
}
