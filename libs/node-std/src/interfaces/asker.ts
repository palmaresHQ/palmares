import { Asker, ImportsError, imports } from '@palmares/std';

export default class AskerNode implements Asker {
  async ask(question: string): Promise<string> {
    const [createInterface, input, output] = await Promise.all([
      imports<typeof import('readline').createInterface>('readline', {
        apiName: 'createInterface',
      }),
      imports<typeof import('process').stdin>('process', {
        apiName: 'stdin',
      }),
      imports<typeof import('process').stdout>('process', {
        apiName: 'stdout',
      }),
    ]);
    if (createInterface && input && output) {
      const readlineInterface = createInterface({ input, output });
      return new Promise((resolve) => {
        readlineInterface.question(question, (answer) => {
          readlineInterface.close();
          resolve(answer);
        });
      });
    }
    throw new ImportsError(
      'nodejs readline createInterface or process stdin or stdout'
    );
  }
}
