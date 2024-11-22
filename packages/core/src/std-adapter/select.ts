export interface AskSelect {
  close: () => void;
  ask: (
    question: string,
    options: string[],
    registerWrite: (writeCallback: (valueToWrite: string) => void) => void,
    args: {
      onUp: () => void;
      onDown: () => void;
      onSelect: () => string;
      clearConsole: (length?: number) => string;
      renderOption: (index: number) => string;
    }
  ) => Promise<string | undefined>;
}
