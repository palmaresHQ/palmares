import { exec, spawn } from 'child_process';

import type { ChildProcess } from '@palmares/core';

export class ChildProcessNode implements ChildProcess {
  async executeAndOutput(command: string, options?: { liveOutput?: boolean }) {
    return new Promise<string>((resolve, reject) => {
      const executeOutput = exec(command, (error, stdout, _) => {
        if (error) reject(error);
        else resolve(stdout);
      });
      if (options?.liveOutput) executeOutput.stdout?.pipe(process.stdout);
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
      stdio?: ('overlapped' | 'pipe' | 'ignore' | 'inherit' | 'ipc' | number | null | undefined)[];
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
