export default interface ChildProcess {
  executeAndOutput(command: string): Promise<string>;
  spawn(
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
  ): Promise<void>;
}
