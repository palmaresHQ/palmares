import { spawn } from 'child_process';
import { readFile } from 'fs';
import { join } from 'path';

/** Runs a given command under spawn from node's `child_process` */
export function runCommand(command: string, args: string[]): Promise<Buffer> {
  // eslint-disable-next-line ts/no-unnecessary-condition
  const { stdout, stderr } = spawn(command, args || []);

  return new Promise((resolve, reject) => {
    stdout.on('data', (data) => resolve(data));
    stderr.on('data', (data) => resolve(data));
    stderr.on('error', (error) => reject(error));
    stdout.on('error', (error) => reject(error));
  });
}

export function getChangelogFile(packagePath: string): Promise<string | undefined> {
  const changelogPath = join(packagePath, `CHANGELOG.md`);
  console.log(packagePath, changelogPath);
  return new Promise((resolve) => {
    readFile(changelogPath, (error, data) => {
      if (error) resolve(undefined);
      else resolve(data.toString());
    });
  });
}
