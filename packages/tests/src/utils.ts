import TestAdapter from './adapter';

let testAdapter: TestAdapter | undefined = undefined;

export function setTestAdapter(adapter: TestAdapter) {
  testAdapter = adapter;
}

export function getTestAdapter() {
  if (!testAdapter) {
    throw new Error('Test adapter not set');
  }
  return testAdapter;
}
