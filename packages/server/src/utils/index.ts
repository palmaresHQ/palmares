export * from './constants';

export function snakeCaseToCamelCase(str: string) {
  return str.replace(/([-_][a-z])/ig, (letter) => {
    return letter.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
}

export function camelCaseToHyphenOrSnakeCase(string: string, isSnake = true) {
  return string.replace(/[A-Z]+/g, letter => `${isSnake ? '_' : '-'}${letter.toLowerCase()}`)
}
