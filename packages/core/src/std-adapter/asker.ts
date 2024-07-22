export default interface Asker {
  ask: (question: string) => Promise<string>;
}
