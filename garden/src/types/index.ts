export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  images: string[];
  mood?: string;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  links: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  url: string;
  thumbUrl: string;
  caption: string;
  category: string;
  takenAt: string;
  uploadedAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  tags: string[];
  note: string;
  createdAt: string;
}

export interface Idea {
  id: string;
  content: string;
  type: 'text' | 'link' | 'image';
  source?: string;
  isDraft: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'long-term' | 'short-term';
  tasks: Task[];
  deadline?: string;
  progress: number;
  createdAt: string;
}

export interface Task {
  id: string;
  content: string;
  completed: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: string;
  images: string[];
}

export interface ReadingItem {
  id: string;
  title: string;
  type: 'book' | 'movie' | 'music' | 'game' | 'article';
  rating: number;
  review: string;
  url?: string;
  createdAt: string;
}

export interface GuestbookMessage {
  id: string;
  name: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

export interface SiteStats {
  totalJournals: number;
  totalNotes: number;
  totalPhotos: number;
  totalFiles: number;
  totalIdeas: number;
  totalGoals: number;
  activeDays: ActiveDay[];
}

export interface ActiveDay {
  date: string;
  count: number;
}
