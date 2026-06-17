import { create } from 'zustand';
import type { SiteStats } from '../types';

interface AppState {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  stats: SiteStats;
  updateStats: (patch: Partial<SiteStats>) => void;
}

export const useStore = create<AppState>()((set) => ({
  theme: 'dark',
  setTheme: (t) => set({ theme: t }),
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  stats: {
    totalJournals: 0,
    totalNotes: 0,
    totalPhotos: 0,
    totalFiles: 0,
    totalIdeas: 0,
    totalGoals: 0,
    activeDays: [],
  },
  updateStats: (patch) => set((s) => ({ stats: { ...s.stats, ...patch } })),
}));
