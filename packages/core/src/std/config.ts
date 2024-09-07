import { StdNotSetError } from './exceptions';

import type { Std } from '../std-adapter';

declare global {
  // eslint-disable-next-line no-var
  var $PCachedDefaultStd: undefined | Std;
}

/**
 * This will set the default standard library thats being used by the application, so you can load it at any time in
 * your application.
 */
export function setDefaultStd(std: Std) {
  globalThis.$PCachedDefaultStd = std;
}

/**
 * If no standard library is set, this will throw an error.
 */
export function getDefaultStd() {
  if (globalThis.$PCachedDefaultStd === undefined) throw new StdNotSetError();
  return globalThis.$PCachedDefaultStd;
}
