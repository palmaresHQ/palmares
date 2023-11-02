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
 * Creates a deep copy of an object. If you do {...obj} we will create a new reference of the object but we will not deeply
 * clone the objects inside of that object. This means that changes for nested objects will be applied to all objects. The same
 * happens if we are trying to create a new copy of an array.
 *
 * @param objectOrArray - The object or array to be deeply copied.
 * @returns - The object copy.
 */
export function structuredClone<TObjectOrArray extends Record<string | number, any> | any[]>(objectOrArray: TObjectOrArray): TObjectOrArray {
  if (!objectOrArray) return objectOrArray;
  if (typeof objectOrArray !== 'object') return objectOrArray;

  // Ref: https://github.com/nodejs/node/issues/34355#issuecomment-658394617
  if(Array.isArray(objectOrArray)) {
    const newArray = [] as unknown as TObjectOrArray;
    for (let i = 0; i < objectOrArray.length; i++) {
      const valueAtIndex = !objectOrArray[i] || typeof objectOrArray[i] !== 'object' ? objectOrArray[i] : structuredClone(objectOrArray[i]);
      newArray[i] = valueAtIndex === undefined ? null : valueAtIndex;
    }
    return newArray;
  }

  const newObject = {} as TObjectOrArray;
  for(const key of Object.keys(objectOrArray)){
    const valueAtKey = !objectOrArray[key] || typeof objectOrArray[key] !== 'object' ? objectOrArray[key] : structuredClone(objectOrArray[key]);
    if (valueAtKey === undefined) continue;
    (newObject as any)[key] = valueAtKey;
  }

  return newObject;
}
