import { stdin as input, stdout as output } from 'process';
import { createInterface } from 'readline';

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
}
