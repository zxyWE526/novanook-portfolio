export type KeyboardState = 'idle' | 'answering' | 'reviewing' | 'navigating';

export interface KeyBinding {
  key: string;
  description: string;
  action: string;
  states: KeyboardState[];
}

export interface KeyboardSnapshot {
  state: KeyboardState;
  activeQuestionIndex: number;
  selectedOption: string | null;
  showAnswer: boolean;
}
