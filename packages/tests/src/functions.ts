import TestAdapter from './adapter';
import getExpect, { Expect } from './expect';
import { getTestAdapter } from './utils';

export function describe<TTestAdapter extends TestAdapter = TestAdapter>(descriptionName: string, callback: (args: {
  test: typeof test<TTestAdapter>
} & {
  custom: ReturnType<TTestAdapter['getCustomProps']>
}) => void) {
  const defaultTestAdapter = getTestAdapter();
  defaultTestAdapter.functions.getDescribe(descriptionName, () => {
    callback({ test: test, custom: defaultTestAdapter.getCustomProps() as any })
  });
}

export function test<TTestAdapter extends TestAdapter = TestAdapter>(testName: string, callback: (args: {
  expect: typeof expect
} & {
  custom: ReturnType<TTestAdapter['getCustomProps']>
}) => Promise<void>) {
  const defaultTestAdapter = getTestAdapter();

  defaultTestAdapter.functions.getTest(testName,
    () => callback({
    expect: expect,
    custom: defaultTestAdapter.getCustomProps() as any
  }));
}

export function expect<TValue>(value: TValue): Expect<TValue, false> {
  return getExpect<TValue>(value, getTestAdapter());
}
