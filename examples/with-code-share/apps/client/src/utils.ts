import initializeClient from '@palmares/client'
import { QueryClient } from '@tanstack/react-query'
import type settings from '../../server/src/settings'

export const pFetch = initializeClient<typeof settings>('http://localhost:3001')

export const queryClient = new QueryClient()

export const formatErrors = (
  errors: {
    code: string,
    message: string,
    path: string[]
  }[]
) => {
  return errors.reduce((acc, error) => {
    const path = error.path.join('.') || error.code;
    return { ...acc, [path]: error }
  }, {});
}

export class MutationErrors extends Error {
  errors: Parameters<typeof formatErrors>[0];

  constructor(errors: Parameters<typeof formatErrors>[0]) {
    super('Failed to update item');
    this.name = 'MutationErrors';
    this.errors = errors;
  }
}

export function uuid() {
  let date = new Date().getTime();
  const browserOrNodePerformance = (globalThis).performance as typeof performance | undefined;
  let performanceDate =
    (browserOrNodePerformance && browserOrNodePerformance.now && browserOrNodePerformance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    let randomNumber = Math.random() * 16;
    if (date > 0) {
      randomNumber = (date + randomNumber) % 16 | 0;
      date = Math.floor(date / 16);
    } else {
      randomNumber = (performanceDate + randomNumber) % 16 | 0;
      performanceDate = Math.floor(performanceDate / 16);
    }
    return (character === 'x' ? randomNumber : (randomNumber & 0x3) | 0x8).toString(16);
  });
}

/**
 * This function adds the functionality of delaying a
 * function execution based on a certain timeout.
 *
 * See, for reference: https://www.freecodecamp.org/news/javascript-debounce-example/
 *
 * @param functionToDelay - The function to be delayed
 * @param timeout - The timeout in milliseconds
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<TFunctionToDelay extends (...args: any) => any>(timeout = 300) {
  let timer: NodeJS.Timeout | number;
  return (functionToDelay: TFunctionToDelay) => {
    clearTimeout(timer);
    timer = setTimeout(functionToDelay, timeout);
  };
}