import { nanoid } from 'nanoid';
import type {
  TaskPCB,
  TaskPriority,
  TaskState,
  SchedulerAlgorithm,
  SchedulerState,
  Checkpoint,
} from '../types/scheduler';

const STORAGE_KEY = 'cs408-scheduler';

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function now(): string {
  return new Date().toISOString();
}

function createCheckpoint(task: TaskPCB): Checkpoint {
  return {
    timestamp: now(),
    state: task.state,
    timeUsed: task.timeUsed,
    progress: task.burstTime > 0
      ? Math.min(1, task.timeUsed / task.burstTime)
      : 0,
    notes: '',
  };
}

type TaskCreateInput = Omit<
  TaskPCB,
  'pid' | 'createdAt' | 'completedAt' | 'turnaroundTime' | 'waitingTime' | 'checkpoints'
>;

export class SchedulerService {
  state: SchedulerState;

  constructor() {
    this.state = {
      algorithm: 'round-robin',
      timeQuantum: 30,
      taskQueue: [],
      currentTask: null,
      history: [],
    };
    this.load();
  }

  setAlgorithm(algo: SchedulerAlgorithm): void {
    this.state.algorithm = algo;
    this.save();
  }

  setTimeQuantum(seconds: number): void {
    this.state.timeQuantum = Math.max(1, seconds);
    this.save();
  }

  createTask(data: TaskCreateInput): TaskPCB {
    const task: TaskPCB = {
      ...data,
      pid: nanoid(8),
      createdAt: now(),
      completedAt: null,
      turnaroundTime: 0,
      waitingTime: 0,
      checkpoints: [],
    };
    this.state.taskQueue.push(task);
    this.save();
    return task;
  }

  schedule(): TaskPCB | null {
    if (this.state.currentTask) {
      this.preempt();
    }

    if (this.state.taskQueue.length === 0) return null;

    const queue = this.state.taskQueue;
    let selected: TaskPCB;

    switch (this.state.algorithm) {
      case 'priority': {
        queue.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
        selected = queue.shift()!;
        break;
      }
      case 'fcfs': {
        selected = queue.shift()!;
        break;
      }
      case 'round-robin':
      default: {
        selected = queue.shift()!;
        selected.timeSlice = this.state.timeQuantum;
        break;
      }
    }

    selected.state = 'running';
    selected.checkpoints.push(createCheckpoint(selected));
    this.state.currentTask = selected;
    this.save();
    return selected;
  }

  preempt(): TaskPCB | null {
    const current = this.state.currentTask;
    if (!current || current.state !== 'running') return null;

    current.state = 'preempted';
    current.checkpoints.push(createCheckpoint(current));
    this.state.taskQueue.push(current);
    this.state.currentTask = null;
    this.save();
    return current;
  }

  complete(pid: string): void {
    const current = this.state.currentTask;
    if (current && current.pid === pid) {
      current.state = 'completed';
      current.completedAt = now();
      current.timeRemaining = 0;
      current.checkpoints.push(createCheckpoint(current));
      const createdAt = new Date(current.createdAt).getTime();
      const completedAt = new Date(current.completedAt).getTime();
      current.turnaroundTime = Math.round((completedAt - createdAt) / 1000);
      current.waitingTime = Math.max(0, current.turnaroundTime - current.burstTime);
      this.state.history.push({ ...current });
      this.state.currentTask = null;
      this.save();
      return;
    }

    const idx = this.state.taskQueue.findIndex((t) => t.pid === pid);
    if (idx !== -1) {
      const task = this.state.taskQueue[idx];
      task.state = 'completed';
      task.completedAt = now();
      task.timeRemaining = 0;
      task.checkpoints.push(createCheckpoint(task));
      const createdAt = new Date(task.createdAt).getTime();
      const completedAt = new Date(task.completedAt).getTime();
      task.turnaroundTime = Math.round((completedAt - createdAt) / 1000);
      task.waitingTime = Math.max(0, task.turnaroundTime - task.burstTime);
      this.state.taskQueue.splice(idx, 1);
      this.state.history.push({ ...task });
      this.save();
    }
  }

  tick(): void {
    const current = this.state.currentTask;
    if (!current || current.state !== 'running') return;

    current.timeUsed += 1;
    current.timeRemaining = Math.max(0, current.timeRemaining - 1);

    if (current.timeRemaining <= 0) {
      this.complete(current.pid);
    } else if (
      this.state.algorithm === 'round-robin' &&
      current.timeUsed % this.state.timeQuantum === 0
    ) {
      this.preempt();
      this.schedule();
    }
  }

  getState(): SchedulerState {
    return this.state;
  }

  getReadyQueue(): TaskPCB[] {
    return this.state.taskQueue.filter((t) => t.state === 'ready' || t.state === 'preempted');
  }

  getHistory(): TaskPCB[] {
    return this.state.history;
  }

  reset(): void {
    this.state = {
      algorithm: 'round-robin',
      timeQuantum: 30,
      taskQueue: [],
      currentTask: null,
      history: [],
    };
    this.save();
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // storage full or unavailable
    }
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SchedulerState;
        this.state.algorithm = parsed.algorithm ?? 'round-robin';
        this.state.timeQuantum = parsed.timeQuantum ?? 30;
        this.state.taskQueue = parsed.taskQueue ?? [];
        this.state.currentTask = parsed.currentTask ?? null;
        this.state.history = parsed.history ?? [];
      }
    } catch {
      // corrupted data
    }
  }
}

export const scheduler = new SchedulerService();
