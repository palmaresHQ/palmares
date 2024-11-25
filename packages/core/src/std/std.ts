import { getDefaultStd } from './config';
import { FileOrDirectoryDoesNotExistError } from './exceptions';

const clearConsole = (length: number) => {
  //adapted from sindresorhus ansi-escape module
  const ESC = '\u001B[';
  const eraseLine = ESC + '2K';
  const cursorUp = (count = 1) => ESC + count + 'A';
  const cursorLeft = ESC + 'G';

  let clear = '';

  for (let i = 0; i < length; i++) clear += eraseLine + (i < length - 1 ? cursorUp() : '');

  if (length) clear += cursorLeft;

  return clear;
};

const std = {
  files: {
    readFromEnv: (envName: string) => getDefaultStd().files.readFromEnv(envName),
    readFile: async (path: string | string[]) => {
      if (Array.isArray(path)) path = await getDefaultStd().files.join(...path);
      const exists = await getDefaultStd().files.exists(path);
      if (!exists) throw new FileOrDirectoryDoesNotExistError(path);
      return getDefaultStd().files.readFile(path);
    },
    join: async (...paths: string[]) => getDefaultStd().files.join(...paths),
    exists: async (path: string | string[]) => {
      if (Array.isArray(path)) path = await getDefaultStd().files.join(...path);
      return getDefaultStd().files.exists(path);
    },
    readDirectory: async (path: string | string[]) => {
      if (Array.isArray(path)) path = await getDefaultStd().files.join(...path);
      const exists = await getDefaultStd().files.exists(path);
      if (!exists) throw new FileOrDirectoryDoesNotExistError(path);
      return getDefaultStd().files.readDirectory(path);
    },
    makeDirectory: async (path: string | string[]) => {
      if (Array.isArray(path)) path = await getDefaultStd().files.join(...path);
      return getDefaultStd().files.makeDirectory(path);
    },
    appendFile: async (path: string | string[], content: string) => {
      if (Array.isArray(path)) path = await getDefaultStd().files.join(...path);
      const exists = await getDefaultStd().files.exists(path);
      if (!exists) throw new FileOrDirectoryDoesNotExistError(path);
      return getDefaultStd().files.appendFile(path, content);
    },
    getPathToFileURL: (path: string) => getDefaultStd().files.getPathToFileURL(path),
    getFileURLToPath: (path: string) => getDefaultStd().files.getFileURLToPath(path),
    writeFile: async (path: string | string[], content: string) => {
      if (Array.isArray(path)) path = await getDefaultStd().files.join(...path);
      return getDefaultStd().files.writeFile(path, content);
    },
    removeFile: async (path: string | string[]) => {
      if (Array.isArray(path)) path = await getDefaultStd().files.join(...path);
      const exists = await getDefaultStd().files.exists(path);
      if (!exists) throw new FileOrDirectoryDoesNotExistError(path);
      return getDefaultStd().files.removeFile(path);
    },
    dirname: (path: string) => {
      return getDefaultStd().files.dirname(path);
    },
    basename: async (path: string | string[]) => {
      if (Array.isArray(path)) path = await getDefaultStd().files.join(...path);
      return await getDefaultStd().files.basename(path);
    },
    relative: (from: string, to: string) => getDefaultStd().files.relative(from, to)
  },
  os: {
    platform: () => getDefaultStd().os.platform(),
    release: () => getDefaultStd().os.release(),
    cwd: () => getDefaultStd().os.cwd()
  },
  childProcess: {
    spawn: (
      command: string,
      args: string[],
      options: {
        /** Code to run when an exist happens */
        onExit?: (code: number | null) => void;
        /** Code to run when an error happens */
        onError?: (error: Error) => void;
        /** Child's stdio configuration */
        stdio?: ('overlapped' | 'pipe' | 'ignore' | 'inherit' | 'ipc' | number | null | undefined)[];
        /** Prepare child to run independently of its parent process */
        detached?: boolean;
      }
    ) => getDefaultStd().childProcess.spawn(command, args, options),
    executeAndOutput: (command: string, options?: { liveOutput?: boolean }) =>
      getDefaultStd().childProcess.executeAndOutput(command, options)
  },
  asker: {
    ask: (question: string) => getDefaultStd().asker.ask(question),
    askClearingScreen: async (question: string[], afterRespond: (answer: string) => string) => {
      const numberOfLines = question.length + 1;
      const actualQuestion = `${question.join('\n')}\n> `;
      const response = getDefaultStd().asker.askClearingScreen(actualQuestion, () => clearConsole(numberOfLines + 1));
      return response.then((answer) => {
        console.log(afterRespond(answer));
        return answer;
      });
    },
    askSelection: (question: string, options: string[]) => {
      const defaultStd = getDefaultStd();
      let selectedOptionIndex = 0;
      let outputWrite: undefined | ((value: string) => void) = undefined;

      const renderOption = (index: number) => {
        const isSelected = index === selectedOptionIndex;
        const isEnding = index === options.length - 1;
        const optionText = `${
          isSelected ? `\x1b[32m\x1b[1m${'>'} ${options[index]}\x1b[0m` : `  ${options[index]}`
        }${isEnding ? '' : '\n'}`;
        return optionText;
      };

      const renderOptions = (isFirstRender: boolean = false) => {
        if (!isFirstRender) outputWrite?.(clearConsole(options.length));

        for (let i = 0; i < options.length; i++) outputWrite?.(renderOption(i));
      };

      const promiseToReturn = defaultStd.asker.select.ask(
        question,
        options,
        (writeCallback) => {
          outputWrite = writeCallback;
        },
        {
          onDown: () => {
            if (selectedOptionIndex >= options.length - 1) return;
            selectedOptionIndex += 1;
            if (outputWrite) renderOptions();
          },
          onUp: () => {
            if (selectedOptionIndex <= 0) return;
            selectedOptionIndex -= 1;
            if (outputWrite) renderOptions();
          },
          onSelect: () => {
            if (outputWrite) {
              outputWrite(clearConsole(options.length + 1));
              console.log(`${question} \x1b[32m${options[selectedOptionIndex]}\x1b[0m`);
            }
            defaultStd.asker.select.close();
            return options[selectedOptionIndex];
          },
          clearConsole: () => clearConsole(options.length),
          renderOption
        }
      );

      // eslint-disable-next-line ts/no-unnecessary-condition
      if (outputWrite) {
        (outputWrite as any)(`${question}\n`);
        renderOptions(true);
      }
      return promiseToReturn;
    }
  }
};

export { std };
