import type { TestAdapter } from './adapter';

declare global {
  // eslint-disable-next-line no-var
  var $PTestAdapter: TestAdapter | undefined;
  // eslint-disable-next-line no-var
  var $PTestAdapterCustomProps: any;
}

export async function setTestAdapter(adapter: TestAdapter, withCustomProps: boolean = false) {
  globalThis.$PTestAdapter = adapter;
  if (withCustomProps) {
    await adapter.getCustomProps().then((props) => {
      globalThis.$PTestAdapterCustomProps = props;
    });
  }
}

export function getTestAdapter() {
  if (!globalThis.$PTestAdapter) {
    throw new Error('Test adapter not set');
  }
  return globalThis.$PTestAdapter;
}

export function getTestAdapterCustomProps() {
  if (!globalThis.$PTestAdapterCustomProps) {
    throw new Error('Test adapter custom props not set');
  }
  return globalThis.$PTestAdapterCustomProps;
}
