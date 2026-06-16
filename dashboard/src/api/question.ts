import type { Question, QuestionDifficulty, QuestionType } from '../types';
import { mockQuestions } from '../services/mockData';

let questions = [...mockQuestions];

export const questionApi = {
  list: (filters?: { subjectId?: string; knowledgePointId?: string; difficulty?: QuestionDifficulty }) => {
    let result = [...questions];
    if (filters?.subjectId) result = result.filter((q) => q.subjectId === filters.subjectId);
    if (filters?.knowledgePointId) result = result.filter((q) => q.knowledgePointId === filters.knowledgePointId);
    if (filters?.difficulty) result = result.filter((q) => q.difficulty === filters.difficulty);
    return Promise.resolve(result);
  },
  getById: (id: string) => Promise.resolve(questions.find((q) => q.id === id) || null),
  count: () => Promise.resolve(questions.length),
};
