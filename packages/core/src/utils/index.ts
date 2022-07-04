export * from './constants';

/**
 * Converts a camelCase string to a snake case string formatting, really easy.
 * 
 * @param string - The string to convert from camel to snake
 * 
 * @returns - The converted string. 
 */
export function camelToSnakeCase(string: string) {
  return string.replace(/[A-Z]+/g, letter => `_${letter.toLowerCase()}`)
}
