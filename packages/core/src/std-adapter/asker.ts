export interface Asker {
  ask: (question: string) => Promise<string>;
}
