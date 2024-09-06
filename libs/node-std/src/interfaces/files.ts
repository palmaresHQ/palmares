import { access, appendFile, constants, mkdir, readFile, readdir, rm, writeFile } from 'fs';
import { basename, dirname, join, relative } from 'path';
import { env } from 'process';

import type { FilesAndFolders } from '@palmares/core';

export class FilesAndFoldersNode implements FilesAndFolders {
  async basename(path: string | string[]): Promise<string> {
    const pathToUse = Array.isArray(path) ? await this.join(...path) : path;
    return basename(pathToUse);
  }

  async relative(from: string, to: string): Promise<string> {
    return relative(from, to);
  }

  async readFromEnv<T = string>(envName: string): Promise<T> {
    return env[envName] as T;
  }

  async readFile(path: string | string[]): Promise<string> {
    let pathAsString: string = path as string;
    if (Array.isArray(path)) pathAsString = await this.join(...path);

    return new Promise((resolve, reject) => {
      readFile(pathAsString, (error, data) => {
        if (error) reject(error);
        else resolve(data.toString());
      });
    });
  }

  async join(...paths: string[]): Promise<string> {
    return join(...paths);
  }

  async exists(path: string | string[]): Promise<boolean> {
    const pathToUse = Array.isArray(path) ? await this.join(...path) : path;
    return new Promise((resolve, reject) => {
      access(pathToUse, constants.F_OK, (error) => {
        if (error) {
          if (error.code === 'ENOENT') resolve(false);
          else reject(error);
        } else resolve(true);
      });
    });
  }

  async writeFile(path: string | string[], content: string): Promise<void> {
    const pathToUse = Array.isArray(path) ? await this.join(...path) : path;
    return new Promise((resolve, reject) => {
      writeFile(pathToUse, content, (error) => {
        if (error) reject(error);
        else resolve(undefined);
      });
    });
  }

  async appendFile(path: string | string[], content: string): Promise<void> {
    const pathToUse = Array.isArray(path) ? await this.join(...path) : path;
    return new Promise((resolve, reject) => {
      appendFile(pathToUse, content, (error) => {
        if (error) reject(error);
        else resolve(undefined);
      });
    });
  }

  async dirname(path: string | string[]): Promise<string> {
    const pathToUse = Array.isArray(path) ? await this.join(...path) : path;
    return dirname(pathToUse);
  }

  async makeDirectory(path: string | string[]): Promise<void> {
    const pathToCreateDirectory = Array.isArray(path) ? await this.join(...path) : path;
    return new Promise((resolve, reject) => {
      mkdir(pathToCreateDirectory, { recursive: true }, (error) => {
        if (error) reject(error);
        else resolve(undefined);
      });
    });
  }

  async readDirectory(path: string | string[]): Promise<string[]> {
    const pathToReadDirectory = Array.isArray(path) ? await this.join(...path) : path;
    return new Promise((resolve, reject) => {
      readdir(pathToReadDirectory, (error, files) => {
        if (error) reject(error);
        else resolve(files);
      });
    });
  }

  async removeFile(path: string | string[]): Promise<void> {
    const pathToRemove = Array.isArray(path) ? await this.join(...path) : path;
    return new Promise((resolve, reject) => {
      rm(pathToRemove, (error) => {
        if (error) reject(error);
        else resolve(undefined);
      });
    });
  }
}
