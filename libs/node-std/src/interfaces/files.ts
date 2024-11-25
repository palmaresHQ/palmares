import { access, appendFile, constants, mkdir, readFile, readdir, rm, writeFile } from 'fs';
import { basename, dirname, join, relative } from 'path';
import { env } from 'process';
import { fileURLToPath, pathToFileURL } from 'url';

import type { FilesAndFolders } from '@palmares/core';

export class FilesAndFoldersNode implements FilesAndFolders {
  async basename(path: string): Promise<string> {
    const pathToUse = Array.isArray(path) ? await this.join(...path) : path;
    return basename(pathToUse);
  }

  async relative(from: string, to: string): Promise<string> {
    return relative(from, to);
  }

  async readFromEnv<T = string>(envName: string): Promise<T> {
    return env[envName] as T;
  }

  async readFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      readFile(path, (error, data) => {
        if (error) reject(error);
        else resolve(data.toString());
      });
    });
  }

  async join(...paths: string[]): Promise<string> {
    return join(...paths);
  }

  async exists(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      access(path, constants.F_OK, (error) => {
        if (error) {
          if (error.code === 'ENOENT') resolve(false);
          else reject(error);
        } else resolve(true);
      });
    });
  }

  getFileURLToPath(path: string) {
    return fileURLToPath(path);
  }

  getPathToFileURL(path: string) {
    return pathToFileURL(path).pathname;
  }

  async writeFile(path: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      writeFile(path, content, (error) => {
        if (error) reject(error);
        else resolve(undefined);
      });
    });
  }

  async appendFile(path: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      appendFile(path, content, (error) => {
        if (error) reject(error);
        else resolve(undefined);
      });
    });
  }

  dirname(path: string): string {
    return dirname(path);
  }

  async makeDirectory(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      mkdir(path, { recursive: true }, (error) => {
        if (error) reject(error);
        else resolve(undefined);
      });
    });
  }

  async readDirectory(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      readdir(path, (error, files) => {
        if (error) reject(error);
        else resolve(files);
      });
    });
  }

  async removeFile(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      rm(path, (error) => {
        if (error) reject(error);
        else resolve(undefined);
      });
    });
  }
}
