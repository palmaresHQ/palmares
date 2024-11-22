import { stdin as input, stdout as output } from 'process';
import { createInterface, emitKeypressEvents } from 'readline';

import type { AskSelect, Asker } from '@palmares/core';

const keyPressHandlerBuilder = (
  asker: AskSelectNode,
  resolve: (value: string | undefined) => void,
  args: {
    onUp: () => void;
    onDown: () => void;
    onSelect: () => string;
    clearConsole: () => string;
    renderOption: (index: number) => string;
  }
) => {
  return (_: any, key: any) => {
    if (key) {
      if (key.name === 'down') args.onDown();
      else if (key.name === 'up') args.onUp();
      else if (key.name === 'escape' || (key.name === 'c' && key.ctrl)) resolve(asker.close() as undefined);
      else if (key.name === 'return') resolve(args.onSelect());
    }
  };
};
let keyPressHandler: ReturnType<typeof keyPressHandlerBuilder> | undefined;
class AskSelectNode implements AskSelect {
  close() {
    input.setRawMode(false);
    input.pause();
    if (keyPressHandler) input.removeListener('keypress', keyPressHandler);
    //input.removeAllListeners();
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
      keyPressHandler = keyPressHandlerBuilder(this, resolve, args);
      emitKeypressEvents(input);
      input.setRawMode(true);
      input.resume();
      input.on('keypress', keyPressHandler);
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
