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
  args?: {
    apiName?: string;
    /**
     * This error code is the code that returns when we have an import error, to see what error code to use, try to run the following
     * code on your environment:
     *
     * ```
     * async function main() {
     *    try {
     *      await import('test');
     *    } catch (e) {
     *      console.log(e.code);
     *    }
     * }
     *
     * main();
     * ```
     *
     * What logs on the console is the error code that you should use.
     *
     * We default to NodeJS error code: 'MODULE_NOT_FOUND'
     */
    errorCode?: string;
    fallback?: () => Promise<void>;
  }
) {
  // This defaults to node error code,
  const errorCodeToConsider =
    typeof args?.errorCode === 'string' ? args.errorCode : 'MODULE_NOT_FOUND';
  const packagePathToUse =
    typeof args?.apiName === 'string' ? args.apiName : 'default';
  try {
    const module = await import(packageName);
    const splittedPackagePath: string[] = packagePathToUse.split('.');
    let result = module;
    for (const key of splittedPackagePath) {
      result = result[key];
    }
    return result as R;
  } catch (e) {
    const error = e as any;
    if (error.code === errorCodeToConsider) {
      if (args?.fallback) return await args.fallback();
    } else {
      throw e;
    }
  }
}
