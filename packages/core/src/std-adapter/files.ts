export interface FilesAndFolders {
  readFromEnv: <T = string>(envName: string) => Promise<T>;
  /**
   * Reads a file from the path, if the path is an array of strings, join the strings with .join()
   * and then work normally
   */
  readFile: (path: string) => Promise<string>;
  join: (...paths: string[]) => Promise<string>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join
   * the strings with .join() and then work normally
   */
  exists: (path: string) => Promise<boolean>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join
   * the strings with .join() and then work normally
   */
  readDirectory: (path: string) => Promise<string[]>;
  makeDirectory: (path: string) => Promise<void>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join
   * the strings with .join() and then work normally
   */
  appendFile: (path: string, content: string) => Promise<void>;
  /**
   * Retrieves the file url from the path. This is useful because of certain OSes
   * that only allows dynamic imports to occur if the path is a URL with file://
   */
  getPathToFileURL: (path: string) => string;

  /**
   * When the path is a simple string work normally, if the path is an array of strings, join
   * the strings with .join() and then work normally
   */
  writeFile: (path: string, content: string) => Promise<void>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join
   * the strings with .join() and then work normally
   */
  removeFile: (path: string) => Promise<void>;
  dirname: (path: string) => Promise<string>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join
   * the strings with .join() and then work normally
   */
  basename: (path: string) => Promise<string>;
  /**
   * Solve the relative path from {from} to {to}.
   */
  relative: (from: string, to: string) => Promise<string>;
}
