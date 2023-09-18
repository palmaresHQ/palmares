import { ChildProcess, ImportsError, imports } from '@palmares/std';

export default class ChildProcessNode implements ChildProcess {
  async executeAndOutput(command: string) {
    const exec = await imports<typeof import('child_process').exec>('child_process', { apiName: 'exec' });
    if (!exec) throw new ImportsError('nodejs child_process exec');
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
    const spawn = await imports<typeof import('child_process').spawn>('child_process', { apiName: 'spawn' });
    if (!spawn) throw new ImportsError('nodejs child_process spawn');

    const child = spawn(command, args, options);
    if (options.onExit) child.on('exit', options.onExit);
    if (options.onError) child.on('error', options.onError);
    return;
  }
}
