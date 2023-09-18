/**
 * Used for common OS operations on palmares.
 */
export default interface Os {
  release(): Promise<string>;
  platform(): Promise<'darwin' | 'windows' | 'linux'>;
}
