import type { WrongQuestion, WrongStatus } from '../types';
import { mockWrongQuestions } from '../services/mockData';

let wrongList = [...mockWrongQuestions];

export const wrongApi = {
  list: (filters?: { status?: WrongStatus; subjectId?: string }) => {
    let result = [...wrongList];
    if (filters?.status) result = result.filter((w) => w.status === filters.status);
    if (filters?.subjectId) result = result.filter((w) => w.question.subjectId === filters.subjectId);
    return Promise.resolve(result);
  },
  updateStatus: (id: string, status: WrongStatus) => {
    wrongList = wrongList.map((w) => (w.id === id ? { ...w, status } : w));
    return Promise.resolve(true);
  },
  count: () => Promise.resolve(wrongList.length),
  countByStatus: () => {
    const counts = { NEW: 0, REVIEWING: 0, MASTERED: 0 };
    wrongList.forEach((w) => { counts[w.status]++; });
    return Promise.resolve(counts);
  },
};
