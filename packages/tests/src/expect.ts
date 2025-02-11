import type { TestAdapter } from './adapter';

export type Expect<
  TValue,
  TTestAdapter extends TestAdapter & Palmares.PTestAdapter = TestAdapter & Palmares.PTestAdapter,
  TIsNot extends boolean = false,
  TIsEventually extends boolean = false
> = {
  not: Expect<TValue, TTestAdapter, true, false>;
  eventually: Expect<TValue, TTestAdapter, TIsNot, true>;
  toBe: <TToBeValue extends TValue>(
    expected: TIsEventually extends true ? Awaited<TToBeValue> : TToBeValue,
    customData?: Parameters<TTestAdapter['expect']['toBe']>[3]
  ) => TIsEventually extends true ? Promise<void> : void;
  toEqual: <TToEqualValue extends TValue>(
    expected: TIsEventually extends true ? Awaited<TToEqualValue> : TToEqualValue,
    customData?: Parameters<TTestAdapter['expect']['toEqual']>[3]
  ) => TIsEventually extends true ? Promise<void> : void;
  toStrictEqual: <TToEqualValue extends TValue>(
    expected: TToEqualValue,
    customData?: Parameters<TTestAdapter['expect']['toStrictEqual']>[3]
  ) => TIsEventually extends true ? Promise<void> : void;
  toBeInstanceOf: (
    expected: { new (...args: any[]): any },
    customData?: Parameters<TTestAdapter['expect']['toBeInstanceOf']>[3]
  ) => TIsEventually extends true ? Promise<void> : void;
} & (TValue extends undefined
  ? {
      toBeDefined: (customData?: Parameters<TTestAdapter['expect']['toBeDefined']>[2]) => void;
    }
  : unknown) &
  (TValue extends null
    ? {
        toBeNull: () => void;
      }
    : unknown) &
  (TValue extends (...args: any[]) => any
    ? {
        toThrow: () => void;
        toHaveBeenCalled: (customData?: Parameters<TTestAdapter['expect']['toHaveBeenCalled']>[3]) => void;
        toHaveBeenCalledTimes: (
          expected: number,
          customData?: Parameters<TTestAdapter['expect']['toHaveBeenCalledTimes']>[2]
        ) => void;
        toHaveBeenCalledWith: (
          args: Parameters<TValue>,
          customData?: Parameters<TTestAdapter['expect']['toHaveBeenCalledTimes']>[3]
        ) => void;
        toHaveReturned: (customData?: Parameters<TTestAdapter['expect']['toHaveReturned']>[2]) => void;
        toHaveReturnedTimes: (
          expected: number,
          customData?: Parameters<TTestAdapter['expect']['toHaveReturnedTimes']>[3]
        ) => void;
      }
    : unknown);

export function getExpect<
  TValue,
  TTestAdapter extends TestAdapter & Palmares.PTestAdapter = TestAdapter & Palmares.PTestAdapter,
  TIsNot extends boolean = false,
  TIsEventually extends boolean = false
>(
  value: TValue,
  testAdapter: TTestAdapter,
  isNot: TIsNot = false as TIsNot,
  isEventually: TIsEventually = false as TIsEventually
): Expect<TValue, TTestAdapter, TIsNot> {
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        if (prop === 'toBe')
          return <TToBeValue extends TValue>(
            expected: TToBeValue,
            customData?: Parameters<TTestAdapter['expect']['toBe']>[3]
          ) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toBe(value, expected, isNot, customData));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toBe(value, expected, isNot, customData);
        else if (prop === 'toEqual') {
          return <TToEqualValue extends TValue>(
            expected: TToEqualValue,
            customData?: Parameters<TTestAdapter['expect']['toEqual']>[3]
          ) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toEqual(value, expected, isNot, customData));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toEqual(value, expected, isNot, customData);
        } else if (prop === 'toStrictEqual')
          return <TToEqualValue extends TValue>(
            expected: TToEqualValue,
            customData?: Parameters<TTestAdapter['expect']['toStrictEqual']>[3]
          ) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toStrictEqual(value, expected, isNot, customData));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toStrictEqual(value, expected, isNot, customData);
        else if (prop === 'toBeInstanceOf')
          return (
            expected: { new (...args: any[]): any },
            customData?: Parameters<TTestAdapter['expect']['toBeInstanceOf']>[3]
          ) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toBeInstanceOf(value, expected, isNot, customData));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toBeInstanceOf(value, expected, isNot, customData);
        else if (prop === 'toBeDefined')
          return (customData?: Parameters<TTestAdapter['expect']['toBeDefined']>[2]) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toBeDefined(value, isNot, customData));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toBeDefined(value, isNot, customData);
        else if (prop === 'toHaveBeenCalled')
          return (customData?: Parameters<TTestAdapter['expect']['toHaveBeenCalled']>[2]) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toHaveBeenCalled(value, isNot, customData));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toHaveBeenCalled(value, isNot, customData);
        else if (prop === 'toHaveBeenCalledTimes')
          return (expected: number, customData?: Parameters<TTestAdapter['expect']['toHaveBeenCalledTimes']>[2]) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toHaveBeenCalledTimes(value, isNot, customData));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toHaveBeenCalledTimes(expected, isNot, customData);
        else if (prop === 'toHaveBeenCalledWith')
          return (
            args: TValue extends (...args: any[]) => any ? Parameters<TValue> : [],
            customData?: Parameters<TTestAdapter['expect']['toHaveBeenCalledWith']>[3]
          ) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toHaveBeenCalledWith(value, args, isNot, customData));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toHaveBeenCalledWith(value, args, isNot, customData);
        else if (prop === 'toHaveReturned')
          return (customData?: Parameters<TTestAdapter['expect']['toHaveReturned']>[2]) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toHaveReturned(value as (...args: any[]) => any, isNot, customData));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toHaveReturned(value as (...args: any[]) => any, isNot, customData);
        else if (prop === 'toHaveReturnedTimes')
          return (expected: number, customData?: Parameters<TTestAdapter['expect']['toHaveReturnedTimes']>[3]) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toHaveReturnedTimes(value, expected, isNot, customData));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toHaveReturnedTimes(value, expected, isNot, customData);
        if (prop === 'not') return getExpect<TValue, TTestAdapter, true>(value, testAdapter, true, false);
        if (prop === 'eventually')
          return getExpect<TValue, TTestAdapter, TIsNot, true>(value, testAdapter, isNot, true);

        throw new Error(`Expect.${String(prop)} is not a function`);
      }
    }
  ) as Expect<TValue, TTestAdapter, TIsNot>;
}
