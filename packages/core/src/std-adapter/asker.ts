export interface Asker {
  ask: (question: string) => Promise<string>;
  askClearingScreen: (question: string[], afterRespond: (answer: string) => string) => Promise<string>;
}
