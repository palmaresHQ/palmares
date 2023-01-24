export default interface FilesAndFolders {
  join(...paths: string[]): Promise<string>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join the strings with .join() and then work normally
   */
  exists(path: string | string[]): Promise<boolean>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join the strings with .join() and then work normally
   */
  readDirectory(path: string | string[]): Promise<string[]>;
  makeDirectory(path: string | string[]): Promise<void>;
  /**
   * When the path is a simple string work normally, if the path is an array of strings, join the strings with .join() and then work normally
   */
  writeFile(path: string | string[], content: string): Promise<void>;
}
