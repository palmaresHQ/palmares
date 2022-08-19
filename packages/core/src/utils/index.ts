export * from './constants';
export { default as imports } from './imports';

/**
 * Converts a snakeCase string to a camelCase string formatting.
 *
 * @param string - The string to convert from snake to camel
 *
 * @returns - The converted string on camelCase
 */
export function snakeCaseToCamelCase(string: string) {
  return string.replace(/([-_][a-z])/ig, (letter) => {
    return letter.toUpperCase()
      .replace('-', '')
      .replace('_', '');
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
  return string.replace(/[A-Z]+/g, letter => `${isSnake ? '_' : '-'}${letter.toLowerCase()}`)
}
