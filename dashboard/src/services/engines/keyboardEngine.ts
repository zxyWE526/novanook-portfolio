import type { KeyboardState } from '../../types/keyboard';

type Callback = (e: KeyboardEvent) => void;

class KeyboardEngine {
  private state: KeyboardState = 'idle';
  private listeners: Map<string, Set<Callback>> = new Map();
  private boundHandler: (e: KeyboardEvent) => void;

  constructor() {
    this.boundHandler = this.handleKey.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.boundHandler);
    }
  }

  getState(): KeyboardState {
    return this.state;
  }

  setState(s: KeyboardState): void {
    this.state = s;
  }

  register(key: string, callback: Callback): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  destroy(): void {
    this.listeners.clear();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundHandler);
    }
  }

  private handleKey(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    const handlers = this.listeners.get(key);
    if (handlers) {
      handlers.forEach((cb) => cb(e));
    }
  }
}

export const keyboardEngine = new KeyboardEngine();
