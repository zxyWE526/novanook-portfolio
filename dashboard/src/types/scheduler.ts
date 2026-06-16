// TaskPCB -- 进程控制块·考研版
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskState = 'ready' | 'running' | 'blocked' | 'completed' | 'preempted';

export interface Checkpoint {
  timestamp: string;
  state: TaskState;
  timeUsed: number;
  progress: number;
  notes: string;
}

export interface TaskPCB {
  pid: string;
  name: string;
  subject: string;
  priority: TaskPriority;
  state: TaskState;
  timeSlice: number;
  timeUsed: number;
  timeRemaining: number;
  burstTime: number;
  turnaroundTime: number;
  waitingTime: number;
  checkpoints: Checkpoint[];
  createdAt: string;
  completedAt: string | null;
  metadata: {
    questionIds: string[];
    difficulty: number;
    relatedTopics: string[];
  };
}

export type SchedulerAlgorithm = 'round-robin' | 'priority' | 'fcfs';

export interface SchedulerState {
  algorithm: SchedulerAlgorithm;
  timeQuantum: number;
  taskQueue: TaskPCB[];
  currentTask: TaskPCB | null;
  history: TaskPCB[];
}
