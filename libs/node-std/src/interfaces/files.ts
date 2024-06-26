import { FilesAndFolders, imports, ImportsError } from '@palmares/std';

export default class FilesAndFoldersNode implements FilesAndFolders {
  async basename(path: string | string[]): Promise<string> {
    const basename = await imports<typeof import('path')['basename']>('path', {
      apiName: 'basename',
    });
    if (basename) {
      const pathToUse = Array.isArray(path) ? await this.join(...path) : path;
      return basename(pathToUse);
    }
    throw new ImportsError('nodejs path basename');
  }

  async relative(from: string, to: string): Promise<string> {
    const relative = await imports<typeof import('path')['relative']>('path', {
      apiName: 'relative',
    });
    if (relative) return relative(from, to);
    throw new ImportsError('nodejs path relative');
  }

  async readFromEnv<T = string>(envName: string): Promise<T> {
    const env = await imports<typeof import('process')['env']>('process', {
      apiName: 'env',
    });
    if (env) return env[envName] as T;
    throw new ImportsError('nodejs process env');
  }

  async readFile(path: string | string[]): Promise<string> {
    let pathAsString: string = path as string;
    if (Array.isArray(path)) pathAsString = await this.join(...path);
    const readFile = await imports<typeof import('fs')['readFile']>('fs', {
      apiName: 'readFile',
    });
    if (readFile) {
      return new Promise((resolve, reject) => {
        readFile(pathAsString, (error, data) => {
          if (error) reject(error);
          else resolve(data.toString());
        });
      });
    }
    throw new ImportsError('nodejs fs readFile');
  }

  async join(...paths: string[]): Promise<string> {
    const join = await imports<typeof import('path')['join']>('path', {
      apiName: 'join',
    });
    if (join) return join(...paths);
    throw new ImportsError('nodejs path join');
  }

  async exists(path: string | string[]): Promise<boolean> {
    const [access, constants] = await Promise.all([
      imports<typeof import('fs')['access']>('fs', {
        apiName: 'access',
      }),
      imports<typeof import('fs')['constants']>('fs', {
        apiName: 'constants',
      }),
    ]);

    if (access && constants) {
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
    throw new ImportsError('nodejs fs access or constants');
  }

  async writeFile(path: string | string[], content: string): Promise<void> {
    const writeFile = await imports<typeof import('fs')['writeFile']>('fs', {
      apiName: 'writeFile',
    });
    if (writeFile) {
      const pathToUse = Array.isArray(path) ? await this.join(...path) : path;
      return new Promise((resolve, reject) => {
        writeFile(pathToUse, content, (error) => {
          if (error) reject(error);
          else resolve(undefined);
        });
      });
    }
    throw new ImportsError('nodejs fs writeFile');
  }

  async appendFile(path: string | string[], content: string): Promise<void> {
    const appendFile = await imports<typeof import('fs')['appendFile']>('fs', {
      apiName: 'appendFile',
    });

    if (appendFile) {
      const pathToUse = Array.isArray(path) ? await this.join(...path) : path;
      return new Promise((resolve, reject) => {
        appendFile(pathToUse, content, (error) => {
          if (error) reject(error);
          else resolve(undefined);
        });
      });
    }
    throw new ImportsError('nodejs fs appendFile');
  }

  async makeDirectory(path: string | string[]): Promise<void> {
    const mkdir = await imports<typeof import('fs')['mkdir']>('fs', {
      apiName: 'mkdir',
    });
    if (mkdir) {
      const pathToCreateDirectory = Array.isArray(path) ? await this.join(...path) : path;
      return new Promise((resolve, reject) => {
        mkdir(pathToCreateDirectory, { recursive: true }, (error) => {
          if (error) reject(error);
          else resolve(undefined);
        });
      });
    }
    throw new ImportsError('nodejs fs mkdir');
  }

  async readDirectory(path: string | string[]): Promise<string[]> {
    const readdir = await imports<typeof import('fs')['readdir']>('fs', {
      apiName: 'readdir',
    });
    if (readdir) {
      const pathToReadDirectory = Array.isArray(path) ? await this.join(...path) : path;
      return new Promise((resolve, reject) => {
        readdir(pathToReadDirectory, (error, files) => {
          if (error) reject(error);
          else resolve(files);
        });
      });
    }
    throw new ImportsError('nodejs fs readdir');
  }
}
