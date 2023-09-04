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
export declare function snakeCaseToCamelCase(string: string): string;
/**
 * Converts a camelCase string to a snake_case or hyphen-case string formatting.
 *
 * @param string - The string to convert from camel to snake or hyphen
 * @param isSnake - If true, the string will be converted to snake_case, if false, it will be converted to hyphen-case. Default to true.
 *
 * @returns - The converted string.
 */
export declare function camelCaseToHyphenOrSnakeCase(string: string, isSnake?: boolean): string;
//# sourceMappingURL=index.d.ts.map