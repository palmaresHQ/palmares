import { exit, stdin as input, stdout as output } from 'process';
import { clearScreenDown, createInterface, emitKeypressEvents, moveCursor } from 'readline';

import type { AskSelect, Asker } from '@palmares/core';

class AskSelectNode implements AskSelect {
  close() {
    input.setRawMode(false);
    input.pause();
    exit(0);
  }

  async ask(
    _question: string,
    _options: string[],
    registerWrite: (writeCallback: (valueToWrite: string) => void) => void,
    args: {
      onUp: () => void;
      onDown: () => void;
      onSelect: () => string;
      clearConsole: () => string;
      renderOption: (index: number) => string;
    }
  ) {
    registerWrite((value: string) => output.write(value));
    return new Promise<string | undefined>((resolve) => {
      emitKeypressEvents(input);
      input.setRawMode(true);
      input.resume();
      input.on('keypress', (_, key) => {
        if (key) {
          if (key.name === 'down') args.onDown();
          else if (key.name === 'up') args.onUp();
          else if (key.name === 'escape' || (key.name === 'c' && key.ctrl)) resolve(this.close() as undefined);
          else if (key.name === 'return') resolve(args.onSelect());
        }
      });
    });
  }
}

export class AskerNode implements Asker {
  select = new AskSelectNode();
  async ask(question: string): Promise<string> {
    const readlineInterface = createInterface({
      input,
      output
    });
    return new Promise((resolve) => {
      readlineInterface.question(question, (answer: string) => {
        readlineInterface.close();
        resolve(answer);
      });
    });
  }
  async askClearingScreen(question: string, clearScreen: () => string): Promise<string> {
    const readlineInterface = createInterface({
      input,
      output
    });
    return new Promise((resolve) => {
      readlineInterface.question(question, (answer) => {
        readlineInterface.close();
        output.write(clearScreen());
        resolve(answer);
      });
    });
  }
}
