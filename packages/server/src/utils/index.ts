export * from './constants';

export function snakeCaseToCamelCase(str: string) {
  return str.replace(/([-_][a-z])/ig, (letter) => {
    return letter.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
}
