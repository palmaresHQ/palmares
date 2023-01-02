import { ERR_MODULE_NOT_FOUND } from './constants';

/**
 * With this function we are able to import a module from a specific path. We don't want to be tied to nodejs runtime, we want
 * to enable the framework to work on any runtime and environment like react native, the browser and many other that might exist.
 *
 * IMPORTANT: When importing multiple modules from different packages like:
 * ```ts
 * const join = await imports<typeof import('path')['join']>('path', 'join');
 * const existsSync = await imports<typeof import('fs')['existsSync']>('fs', 'existsSync');
 * ```
 *
 * Since you are importing modules from different packages NEVER, NEVER do this:
 * ```ts
 * const [join, existsSync] = await Promise.all([
 *    imports<typeof import('path')['join']>('path', 'join'),
 *    imports<typeof import('fs')['existsSync']>('fs', 'existsSync')
 * ]);
 * ```
 *
 * You should always import like the first example
 *
 * @param packageName - The name of the package to import.
 * @param packagePath - The path of the package to import. Defaults to 'default'.
 * @param fallback - The fallback to use if the module is not found. Defaults to undefined.
 *
 * @returns - Returns the imported module.
 */
export default async function imports<R>(
  packageName: string,
  packagePath = 'default',
  fallback?: () => Promise<void>
) {
  try {
    const module = await import(packageName);
    const splittedPackagePath: string[] = packagePath.split('.');
    let result = module;
    for (const key of splittedPackagePath) {
      result = result[key];
    }
    return result as R;
  } catch (e) {
    const error = e as any;
    if (error.code === ERR_MODULE_NOT_FOUND) {
      if (fallback) return await fallback();
    } else {
      throw e;
    }
  }
}
