import { StdNotSetError } from './exceptions';

import type { Std } from '../std-adapter';

let cachedDefaultStd: undefined | Std = undefined;

/**
 * This will set the default standard library thats being used by the application, so you can load it at any time in
 * your application.
 */
export function setDefaultStd(std: Std) {
  cachedDefaultStd = std;
}

/**
 * If no standard library is set, this will throw an error.
 */
export function getDefaultStd() {
  if (cachedDefaultStd === undefined) throw new StdNotSetError();
  return cachedDefaultStd;
}
