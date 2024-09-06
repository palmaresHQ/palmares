/**
 * Used for common OS operations on palmares.
 */
export interface Os {
  release: () => Promise<string>;
  cwd: () => Promise<string>;
  platform: () => Promise<'darwin' | 'windows' | 'linux'>;
}
