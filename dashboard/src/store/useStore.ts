/* =================================================================
   全局状态 - Zustand + LocalStorage Persist
   ================================================================= */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

import type {
  Mistake,
  Attempt,
  DailyFlag,
  ExamRecord,
  ReviewSchedule,
  Settings,
  Subject,
} from '../types';
import { DEFAULT_SUBJECTS, DEFAULT_SETTINGS } from './defaultData';

// ========== Store 接口 ==========
export interface AppState {
  // 数据
  settings: Settings;
  subjects: Subject[];
  mistakes: Mistake[];
  dailyFlags: DailyFlag[];
  examRecords: ExamRecord[];
  lastReviewCheck: string; // ISO date

  // 错题操作
  addMistake: (m: Omit<Mistake, 'id' | 'createdAt' | 'updatedAt' | 'reviewSchedule' | 'attempts'>) => void;
  updateMistake: (id: string, patch: Partial<Mistake>) => void;
  deleteMistake: (id: string) => void;
  addAttempt: (mistakeId: string, attempt: Omit<Attempt, 'attemptId' | 'date'>) => void;
  reviewMistake: (mistakeId: string, result: 'remember' | 'forgot') => void;

  // Flag 操作
  addFlag: (content: string) => void;
  toggleFlag: (id: string) => void;
  removeFlag: (id: string) => void;
  reorderFlags: (ids: string[]) => void;

  // 模考操作
  addExamRecord: (r: Omit<ExamRecord, 'id'>) => void;
  deleteExamRecord: (id: string) => void;

  // 设置
  updateSettings: (patch: Partial<Settings>) => void;

  // 艾宾浩斯
  checkDailyReview: () => string[]; // 返回今日应复习的 mistake IDs
  markLastReviewCheck: () => void;
}

// ========== 辅助：初始化艾宾浩斯 ==========
function createReviewSchedule(): ReviewSchedule {
  return {
    currentRound: 0,
    rounds: [],
    nextReviewAt: null,
  };
}

// ========== Store ==========
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // -------- 初始状态 --------
      settings: DEFAULT_SETTINGS,
      subjects: DEFAULT_SUBJECTS,
      mistakes: [],
      dailyFlags: [],
      examRecords: [],
      lastReviewCheck: '',

      // -------- 错题 CRUD --------
      addMistake: (m) =>
        set((s) => ({
          mistakes: [
            ...s.mistakes,
            {
              ...m,
              id: nanoid(10),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              reviewSchedule: createReviewSchedule(),
              attempts: [],
            },
          ],
        })),

      updateMistake: (id, patch) =>
        set((s) => ({
          mistakes: s.mistakes.map((m) =>
            m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m
          ),
        })),

      deleteMistake: (id) =>
        set((s) => ({ mistakes: s.mistakes.filter((m) => m.id !== id) })),

      addAttempt: (mistakeId, attempt) =>
        set((s) => ({
          mistakes: s.mistakes.map((m) =>
            m.id === mistakeId
              ? {
                  ...m,
                  updatedAt: new Date().toISOString(),
                  attempts: [
                    ...m.attempts,
                    {
                      ...attempt,
                      attemptId: nanoid(8),
                      date: new Date().toISOString(),
                    },
                  ],
                }
              : m
          ),
        })),

      reviewMistake: (mistakeId, result) =>
        set((s) => ({
          mistakes: s.mistakes.map((m) => {
            if (m.id !== mistakeId) return m;

            const schedule = { ...m.reviewSchedule };
            const roundIndex = schedule.currentRound;
            const round = schedule.rounds[roundIndex];

            if (round) {
              round.reviewed = true;
              round.reviewedAt = new Date().toISOString();
              round.result = result;
            }

            // 推进下一轮
            const nextRoundNum = [1, 3, 7, 15][schedule.currentRound + 1];
            if (nextRoundNum !== undefined) {
              const nextDate = new Date();
              nextDate.setDate(nextDate.getDate() + nextRoundNum);
              schedule.currentRound += 1;
              schedule.rounds.push({
                round: nextRoundNum,
                dueDate: nextDate.toISOString().slice(0, 10),
                reviewed: false,
              });
              schedule.nextReviewAt = nextDate.toISOString();
            } else {
              schedule.nextReviewAt = null; // 所有轮次完成
            }

            return { ...m, reviewSchedule: schedule, updatedAt: new Date().toISOString() };
          }),
        })),

      // -------- Flag --------
      addFlag: (content) =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10);
          const todayFlags = s.dailyFlags.filter((f) => f.date === today);
          return {
            dailyFlags: [
              ...s.dailyFlags,
              {
                id: nanoid(8),
                content,
                date: today,
                completed: false,
                order: todayFlags.length,
              },
            ],
          };
        }),

      toggleFlag: (id) =>
        set((s) => ({
          dailyFlags: s.dailyFlags.map((f) =>
            f.id === id
              ? {
                  ...f,
                  completed: !f.completed,
                  completedAt: !f.completed ? new Date().toISOString() : undefined,
                }
              : f
          ),
        })),

      removeFlag: (id) =>
        set((s) => ({ dailyFlags: s.dailyFlags.filter((f) => f.id !== id) })),

      reorderFlags: (ids) =>
        set((s) => {
          const map = new Map(s.dailyFlags.map((f) => [f.id, f]));
          return {
            dailyFlags: ids.map((id, i) => {
              const f = map.get(id);
              return f ? { ...f, order: i } : f;
            }).filter(Boolean) as DailyFlag[],
          };
        }),

      // -------- 模考 --------
      addExamRecord: (r) =>
        set((s) => ({ examRecords: [...s.examRecords, { ...r, id: nanoid(10) }] })),
      deleteExamRecord: (id) =>
        set((s) => ({ examRecords: s.examRecords.filter((r) => r.id !== id) })),

      // -------- 设置 --------
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      // -------- 艾宾浩斯 --------
      checkDailyReview: () => {
        const { mistakes } = get();
        const now = new Date().toISOString();
        return mistakes
          .filter((m) => {
            if (!m.reviewSchedule.nextReviewAt) return false;
            return m.reviewSchedule.nextReviewAt <= now;
          })
          .map((m) => m.id);
      },

      markLastReviewCheck: () =>
        set({ lastReviewCheck: new Date().toISOString().slice(0, 10) }),
    }),
    { name: 'exam-dashboard-data' }
  )
);
