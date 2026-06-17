import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  JournalEntry, Note, Photo, FileItem, Idea,
  Goal, Task, TimelineEvent, ReadingItem, GuestbookMessage, SiteStats,
} from '../types';

interface AppState {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  journals: JournalEntry[];
  addJournal: (j: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJournal: (id: string, patch: Partial<JournalEntry>) => void;
  deleteJournal: (id: string) => void;

  notes: Note[];
  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  photos: Photo[];
  addPhoto: (p: Omit<Photo, 'id' | 'uploadedAt'>) => void;
  deletePhoto: (id: string) => void;

  files: FileItem[];
  addFile: (f: Omit<FileItem, 'id' | 'createdAt'>) => void;
  deleteFile: (id: string) => void;

  ideas: Idea[];
  addIdea: (i: Omit<Idea, 'id' | 'createdAt'>) => void;
  deleteIdea: (id: string) => void;

  goals: Goal[];
  addGoal: (g: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addTask: (goalId: string, content: string) => void;
  removeTask: (goalId: string, taskId: string) => void;
  toggleTask: (goalId: string, taskId: string) => void;

  timeline: TimelineEvent[];
  addEvent: (e: Omit<TimelineEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;

  readings: ReadingItem[];
  addReading: (r: Omit<ReadingItem, 'id' | 'createdAt'>) => void;
  deleteReading: (id: string) => void;

  messages: GuestbookMessage[];
  addMessage: (m: Omit<GuestbookMessage, 'id' | 'createdAt'>) => void;
  approveMessage: (id: string) => void;
  deleteMessage: (id: string) => void;

  stats: SiteStats;
  recalcStats: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (t) => {
        if (typeof document !== 'undefined') {
          if (t === 'light') {
            document.documentElement.classList.add('light');
          } else {
            document.documentElement.classList.remove('light');
          }
        }
        set({ theme: t });
      },
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      journals: [],
      addJournal: (j) =>
        set((s) => ({
          journals: [
            ...s.journals,
            {
              ...j,
              id: nanoid(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateJournal: (id, patch) =>
        set((s) => ({
          journals: s.journals.map((j) =>
            j.id === id ? { ...j, ...patch, updatedAt: new Date().toISOString() } : j
          ),
        })),
      deleteJournal: (id) =>
        set((s) => ({ journals: s.journals.filter((j) => j.id !== id) })),

      notes: [],
      addNote: (n) =>
        set((s) => ({
          notes: [
            ...s.notes,
            {
              ...n,
              id: nanoid(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
          ),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      photos: [],
      addPhoto: (p) =>
        set((s) => ({
          photos: [...s.photos, { ...p, id: nanoid(), uploadedAt: new Date().toISOString() }],
        })),
      deletePhoto: (id) =>
        set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),

      files: [],
      addFile: (f) =>
        set((s) => ({
          files: [...s.files, { ...f, id: nanoid(), createdAt: new Date().toISOString() }],
        })),
      deleteFile: (id) =>
        set((s) => ({ files: s.files.filter((f) => f.id !== id) })),

      ideas: [],
      addIdea: (i) =>
        set((s) => ({
          ideas: [...s.ideas, { ...i, id: nanoid(), createdAt: new Date().toISOString() }],
        })),
      deleteIdea: (id) =>
        set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) })),

      goals: [],
      addGoal: (g) =>
        set((s) => ({
          goals: [
            ...s.goals,
            { ...g, id: nanoid(), createdAt: new Date().toISOString() },
          ],
        })),
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      addTask: (goalId, content) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const tasks = [...g.tasks, { id: nanoid(), content, completed: false }];
            const done = tasks.filter((t) => t.completed).length;
            const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
            return { ...g, tasks, progress };
          }),
        })),
      removeTask: (goalId, taskId) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const tasks = g.tasks.filter((t) => t.id !== taskId);
            const done = tasks.filter((t) => t.completed).length;
            const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
            return { ...g, tasks, progress };
          }),
        })),
      toggleTask: (goalId, taskId) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const tasks = g.tasks.map((t: Task) =>
              t.id === taskId ? { ...t, completed: !t.completed } : t
            );
            const done = tasks.filter((t) => t.completed).length;
            const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
            return { ...g, tasks, progress };
          }),
        })),

      timeline: [],
      addEvent: (e) =>
        set((s) => ({
          timeline: [...s.timeline, { ...e, id: nanoid() }],
        })),
      deleteEvent: (id) =>
        set((s) => ({ timeline: s.timeline.filter((e) => e.id !== id) })),

      readings: [],
      addReading: (r) =>
        set((s) => ({
          readings: [
            ...s.readings,
            { ...r, id: nanoid(), createdAt: new Date().toISOString() },
          ],
        })),
      deleteReading: (id) =>
        set((s) => ({ readings: s.readings.filter((r) => r.id !== id) })),

      messages: [],
      addMessage: (m) =>
        set((s) => ({
          messages: [
            ...s.messages,
            { ...m, id: nanoid(), createdAt: new Date().toISOString() },
          ],
        })),
      approveMessage: (id) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, approved: true } : m
          ),
        })),
      deleteMessage: (id) =>
        set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),

      stats: {
        totalJournals: 0,
        totalNotes: 0,
        totalPhotos: 0,
        totalFiles: 0,
        totalIdeas: 0,
        totalGoals: 0,
        activeDays: [],
      },
      recalcStats: () => {
        const { journals, notes, photos, files, ideas, goals } = get();
        set({
          stats: {
            totalJournals: journals.length,
            totalNotes: notes.length,
            totalPhotos: photos.length,
            totalFiles: files.length,
            totalIdeas: ideas.length,
            totalGoals: goals.length,
            activeDays: [],
          },
        });
      },
    }),
    { name: 'digital-garden-data' }
  )
);
