import { stdin as input, stdout as output } from 'process';
import { clearScreenDown, createInterface, moveCursor } from 'readline';

import type { Asker } from '@palmares/core';

export class AskerNode implements Asker {
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
  async askClearingScreen(question: string[], afterRespond: (answer: string) => string): Promise<string> {
    const readlineInterface = createInterface({
      input,
      output
    });
    const numberOfLines = question.length + 1;
    return new Promise((resolve) => {
      readlineInterface.question(`${question.join('\n')}\n> `, (answer) => {
        readlineInterface.close();
        moveCursor(output, 0, -numberOfLines);
        clearScreenDown(output);
        console.log(afterRespond(answer));
        resolve(answer);
      });
    });
  }
}
