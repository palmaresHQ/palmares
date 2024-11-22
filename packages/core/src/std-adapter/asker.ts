import type { AskSelect } from './select';

export interface Asker {
  select: AskSelect;
  ask: (question: string) => Promise<string>;
  askClearingScreen: (question: string, clearScreen: () => string) => Promise<string>;
}
