import type { Subject } from '../types';
import { mockSubjects } from '../services/mockData';

let subjects = [...mockSubjects];

export const subjectApi = {
  list: () => Promise.resolve([...subjects]),
  getById: (id: string) => Promise.resolve(subjects.find((s) => s.id === id) || null),
  create: (data: Omit<Subject, 'id' | 'createdAt'>) => {
    const newSubject: Subject = {
      ...data,
      id: `sub-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    subjects.push(newSubject);
    return Promise.resolve(newSubject);
  },
  update: (id: string, data: Partial<Subject>) => {
    subjects = subjects.map((s) => (s.id === id ? { ...s, ...data } : s));
    return Promise.resolve(subjects.find((s) => s.id === id) || null);
  },
  delete: (id: string) => {
    subjects = subjects.filter((s) => s.id !== id);
    return Promise.resolve(true);
  },
};
