import { ChildProcess } from '@palmares/core';

import { exec, spawn } from 'child_process';
export default class ChildProcessNode implements ChildProcess {
  async executeAndOutput(command: string) {
      return new Promise<string>((resolve, reject) => {
      exec(command, (error, stdout, _) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
  }
  async spawn(
    command: string,
    args: string[],
    options: {
      /** Code to run when an exist happens */
      onExit?: (code: number | null) => void;
      /** Code to run when an error happens */
      onError?: (error: Error) => void;
      /** Child's stdio configuration */
      stdio?: Array<'overlapped' | 'pipe' | 'ignore' | 'inherit' | 'ipc' | number | null | undefined>;
      /** Prepare child to run independently of its parent process */
      detached?: boolean;
    }
  ) {
    const child = spawn(command, args, options);
    if (options.onExit) child.on('exit', options.onExit);
    if (options.onError) child.on('error', options.onError);
    return;
  }
}
