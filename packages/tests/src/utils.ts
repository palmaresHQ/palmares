import type { TestAdapter } from './adapter';

declare global {
  // eslint-disable-next-line no-var
  var $PTestAdapter: TestAdapter | undefined;
}

export function setTestAdapter(adapter: TestAdapter) {
  globalThis.$PTestAdapter = adapter;
}

export function getTestAdapter() {
  if (!globalThis.$PTestAdapter) {
    throw new Error('Test adapter not set');
  }
  return globalThis.$PTestAdapter;
}
