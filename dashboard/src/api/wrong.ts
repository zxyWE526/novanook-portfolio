import type { WrongStatus } from '../types';

const LS_KEY = 'cs408-wrong';

function load(): WrongQuestion[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}

function save(data: WrongQuestion[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export const wrongApi = {
  list: (filters?: { status?: WrongStatus; subjectId?: string }) => {
    let result = load();
    if (filters?.status) result = result.filter((w) => w.status === filters.status);
    if (filters?.subjectId) result = result.filter((w) => w.question.subjectId === filters.subjectId);
    return Promise.resolve(result);
  },
  updateStatus: (id: string, status: WrongStatus) => {
    const data = load().map((w) => (w.id === id ? { ...w, status } : w));
    save(data);
    return Promise.resolve(true);
  },
  count: () => Promise.resolve(load().length),
  countByStatus: () => {
    const data = load();
    const counts = { NEW: 0, REVIEWING: 0, MASTERED: 0 };
    data.forEach((w) => { counts[w.status]++; });
    return Promise.resolve(counts);
  },
};
