import { Asker } from '@palmares/core';

import { createInterface } from 'readline';
import { stdin as input, stdout as output } from 'process';

export default class AskerNode implements Asker {
  async ask(question: string): Promise<string> {
    const readlineInterface = createInterface({
      input,
      output,
    });
    return new Promise((resolve) => {
      readlineInterface.question(question, (answer: string) => {
        readlineInterface.close();
        resolve(answer);
      });
    });
  }
}
