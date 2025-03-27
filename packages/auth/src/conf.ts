import { AuthAdapterException } from './exceptions';

import type { AdapterMethods, AuthAdapter } from './adapter';

declare global {
  // eslint-disable-next-line no-var
  var $PAuthAdapters: AuthAdapter[] | undefined;

  namespace Palmares {
    interface PAuth {}
  }
}

export function setAdapters(adapters: AuthAdapter[]) {
  globalThis.$PAuthAdapters = adapters;
}

export function getAdapters() {
  if (!globalThis.$PAuthAdapters) throw new AuthAdapterException('AuthAdapter', 'No adapter has been set');

  return globalThis.$PAuthAdapters;
}
