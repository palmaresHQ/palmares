import { useMemo } from 'react';

import { debounce } from '../utils';

/**
 * This hook will return a function, this function will receive a callback. this callback will be executed when the timeout reaches 0.
 *
 * The idea is that for example, on an input, if the user does not stop typing for a certain amount of time, then the callback will not be executed.
 * If the user stops typing for the timeout defined, then the callback will be executed. This is useful to avoid making to many requests to an API.
 *
 * @param timeout - The timeout in milliseconds
 */
export default function useDebounce(timeout = 300) {
  return useMemo(() => debounce(timeout), [timeout]);
}
