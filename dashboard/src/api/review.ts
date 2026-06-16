import type { ReviewTask } from '../types';
import { mockReviewTasks } from '../services/mockData';

let tasks = [...mockReviewTasks];

export const reviewApi = {
  todayTasks: () => {
    const today = new Date().toISOString().slice(0, 10);
    return Promise.resolve(tasks.filter((t) => t.dueDate <= today && !t.completed));
  },
  allTasks: () => Promise.resolve([...tasks]),
  complete: (id: string, result: 'remembered' | 'forgotten') => {
    tasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString(), result } : t
    );
    return Promise.resolve(true);
  },
  pendingCount: () => {
    const today = new Date().toISOString().slice(0, 10);
    return Promise.resolve(tasks.filter((t) => t.dueDate <= today && !t.completed).length);
  },
};
