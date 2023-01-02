import { imports } from '@palmares/core';

import type { Interface } from 'readline';

class Asker {
  #readlineInterface: Interface | null = null;

  /**
   * Functions used for retrieving the readline interface, if it was not created or it was closed
   * we will return a new one.
   *
   * @returns - Returns the readline interface.
   */
  async #getReadlineInterface(): Promise<Interface | undefined> {
    const [createInterface, input, output] = await Promise.all([
      imports<typeof import('readline').createInterface>(
        'readline',
        'createInterface'
      ),
      imports<typeof import('process').stdin>('process', 'stdin'),
      imports<typeof import('process').stdout>('process', 'stdout'),
    ]);
    if (createInterface && input && output) {
      const interfaceIsNotClosed =
        this.#readlineInterface !== null &&
        this.#readlineInterface !== undefined;
      if (interfaceIsNotClosed) return this.#readlineInterface as Interface;
      else {
        this.#readlineInterface = createInterface({ input, output });
        return this.#readlineInterface;
      }
    }
  }

  #closeReadlineInterface(): void {
    const interfaceIsNotClosed =
      this.#readlineInterface !== null && this.#readlineInterface !== undefined;
    if (interfaceIsNotClosed) this.#readlineInterface?.close();
  }

  async theNewAttributeCantHaveNullDoYouWishToContinue(
    modelName: string,
    fieldName: string
  ): Promise<boolean> {
    const question =
      `\x1b[0mIf the model \x1b[33m${modelName}\x1b[0m already have data, ` +
      `it can cause issues when migrating the new \x1b[36m${fieldName}\x1b[0m column ` +
      `because you didn't set a \x1b[33mdefaultValue\x1b[0m or \x1b[33mallowNull \x1b[0mis ` +
      `set to \x1b[33mfalse\x1b[0m. \n` +
      `You can safely ignore this message if you didn't add any data to the table. \n\n` +
      `Press any key to continue or 'CTRL+C' to stop and define the attributes yourself.\n`;
    const readlineInterface = await this.#getReadlineInterface();
    if (readlineInterface) {
      return new Promise((resolve) => {
        readlineInterface.question(question, (answer: string) => {
          if (answer.toLowerCase() === 'n') {
            resolve(false);
          } else {
            resolve(true);
          }
          this.#closeReadlineInterface();
        });
      });
    } else return false;
  }

  async didUserRename(
    modelOrFieldThatWasRenamed: string,
    renamedTo: string
  ): Promise<boolean> {
    const question = `\nDid you rename '${modelOrFieldThatWasRenamed}' to '${renamedTo}'? [y/n]\n`;
    const readlineInterface = await this.#getReadlineInterface();
    if (readlineInterface) {
      return new Promise((resolve, reject) => {
        readlineInterface.question(question, (answer: string) => {
          if (['y', 'n'].includes(answer)) {
            this.#closeReadlineInterface();
            resolve(answer === 'y');
          } else {
            this.didUserRename(modelOrFieldThatWasRenamed, renamedTo)
              .then((response) => resolve(response))
              .catch((error) => reject(error));
          }
        });
      });
    } else return false;
  }

  async didUserRenameToOneOption(
    valueThatWasRenamed: string,
    renamedToOptions: string[]
  ): Promise<string | null> {
    const toOptions = renamedToOptions.map(
      (renamedTo, index) => `${index + 1}. ${renamedTo}`
    );
    const explanation =
      '\nPlease type the corresponding number or leave blank if you have not renamed';
    const question = `\nDid you rename '${valueThatWasRenamed}' to one of the following options? \n${toOptions.join(
      '\n'
    )} \n\n${explanation}\n`;
    const readlineInterface = await this.#getReadlineInterface();
    if (readlineInterface) {
      return new Promise((resolve) => {
        readlineInterface.question(question, (answer: string) => {
          if (answer === '') {
            resolve(null);
          } else {
            try {
              resolve(renamedToOptions[parseInt(answer) - 1]);
            } catch {
              resolve(null);
            }
          }
          this.#closeReadlineInterface();
        });
      });
    } else return null;
  }
}

export default new Asker();
