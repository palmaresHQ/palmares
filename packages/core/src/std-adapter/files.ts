export default interface FilesAndFolders {
  readFromEnv: <T = string>(envName: string) => Promise<T>;
  /**
   * Reads a file from the path, if the path is an array of strings, join the strings with .join() and then work normally
   */
  readFile: (path: string | string[]) => Promise<string>;
  join: (...paths: string[]) => Promise<string>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join the strings with .join() and then work normally
   */
  exists: (path: string | string[]) => Promise<boolean>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join the strings with .join() and then work normally
   */
  readDirectory: (path: string | string[]) => Promise<string[]>;
  makeDirectory: (path: string | string[]) => Promise<void>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join the strings with .join() and then work normally
   */
  appendFile: (path: string | string[], content: string) => Promise<void>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join the strings with .join() and then work normally
   */
  writeFile: (path: string | string[], content: string) => Promise<void>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join the strings with .join() and then work normally
   */
  removeFile: (path: string | string[]) => Promise<void>;
  dirname: (path: string | string[]) => Promise<string>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join the strings with .join() and then work normally
   */
  basename: (path: string | string[]) => Promise<string>;
  /**
   * Solve the relative path from {from} to {to}.
   */
  relative: (from: string, to: string) => Promise<string>;
}
