export * from './constants';
export { default as imports } from './imports';
export * from './types';

/**
 * Converts a snakeCase string to a camelCase string formatting.
 *
 * @param string - The string to convert from snake to camel
 *
 * @returns - The converted string on camelCase
 */
export function snakeCaseToCamelCase(string: string) {
  return string.replace(/([-_][a-z])/gi, (letter) => {
    return letter.toUpperCase().replace('-', '').replace('_', '');
  });
}

/**
 * Converts a camelCase string to a snake_case or hyphen-case string formatting.
 *
 * @param string - The string to convert from camel to snake or hyphen
 * @param isSnake - If true, the string will be converted to snake_case, if false, it will be converted to hyphen-case. Default to true.
 *
 * @returns - The converted string.
 */
export function camelCaseToHyphenOrSnakeCase(string: string, isSnake = true) {
  return string.replace(
    /[A-Z]+/g,
    (letter) => `${isSnake ? '_' : '-'}${letter.toLowerCase()}`
  );
}

/**
 * Creates a deep copy of an object
 * @param obj - The object to be copied.
 * @returns - The object copy.
 */
export function structuredClone<Obj extends {[key: string | number]: any}>(obj: Obj): Obj {
  if (!obj) return obj;
  if (typeof obj !== 'object') return obj;

  // Ref: https://github.com/nodejs/node/issues/34355#issuecomment-658394617
  if(Array.isArray(obj)) {
    const newObj = [] as unknown as Obj;
    for (let i = 0; i < obj.length; i++) {
      const val = !obj[i] || typeof obj[i] !== 'object' ? obj[i] : structuredClone(obj[i]);
      newObj[i] = val === undefined ? null : val;
    }
    return newObj;
  }

  const newObj = {} as Obj;
  for(const i of Object.keys(obj)){
    const val = !obj[i] || typeof obj[i] !== 'object' ? obj[i] : structuredClone(obj[i]);
    if (val === undefined) continue;
    (newObj as any)[i] = val;
  }

  return newObj;
}
