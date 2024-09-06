import type { TestAdapter } from './adapter';

export type Expect<TValue, TIsNot extends boolean = false, TIsEventually extends boolean = false> = {
  not: Expect<TValue, true, false>;
  eventually: Expect<TValue, TIsNot, true>;
  toBe: <TToBeValue extends TValue>(
    expected: TIsEventually extends true ? Awaited<TToBeValue> : TToBeValue
  ) => TIsEventually extends true ? Promise<void> : void;
  toEqual: <TToEqualValue extends TValue>(
    expected: TIsEventually extends true ? Awaited<TToEqualValue> : TToEqualValue
  ) => TIsEventually extends true ? Promise<void> : void;
  toStrictEqual: <TToEqualValue extends TValue>(
    expected: TToEqualValue
  ) => TIsEventually extends true ? Promise<void> : void;
  toBeInstanceOf: (expected: { new (...args: any[]): any }) => TIsEventually extends true ? Promise<void> : void;
  toBeTruthy: () => void;
  toBeFalsy: () => void;
} & (TValue extends undefined
  ? {
      toBeDefined: () => void;
      toBeUndefined: () => void;
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
        toHaveBeenCalled: () => void;
        toHaveBeenCalledTimes: (expected: number) => void;
        toHaveBeenCalledWith: (...args: Parameters<TValue>) => void;
        toHaveReturned: () => void;
        toHaveReturnedTimes: (expected: number) => void;
      }
    : unknown);

export function getExpect<TValue, TIsNot extends boolean = false, TIsEventually extends boolean = false>(
  value: TValue,
  testAdapter: TestAdapter,
  isNot: TIsNot = false as TIsNot,
  isEventually: TIsEventually = false as TIsEventually
): Expect<TValue, TIsNot> {
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        if (prop === 'toBe')
          return <TToBeValue extends TValue>(expected: TToBeValue) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toBe(value, expected, isNot));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toBe(value, expected, isNot);
        else if (prop === 'toEqual')
          return <TToEqualValue extends TValue>(expected: TToEqualValue) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toEqual(value, expected, isNot));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toEqual(value, expected, isNot);
        else if (prop === 'toStrictEqual')
          return <TToEqualValue extends TValue>(expected: TToEqualValue) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toStrictEqual(value, expected, isNot));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toStrictEqual(value, expected, isNot);
        else if (prop === 'toBeInstanceOf')
          return (expected: { new (...args: any[]): any }) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toBeInstanceOf(value, expected, isNot));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toBeInstanceOf(value, expected, isNot);
        else if (prop === 'toBeDefined')
          return () =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toBeDefined(value, isNot));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toBeDefined(value, isNot);
        else if (prop === 'toHaveBeenCalled')
          return () =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toHaveBeenCalled(value, isNot));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toHaveBeenCalled(value, isNot);
        else if (prop === 'toHaveBeenCalledTimes')
          return (expected: number) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toHaveBeenCalledTimes(value, isNot));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toHaveBeenCalledTimes(expected, isNot);
        else if (prop === 'toHaveBeenCalledWith')
          return (args: TValue extends (...args: any[]) => any ? Parameters<TValue> : []) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toHaveBeenCalledWith(value, args, isNot));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toHaveBeenCalledWith(value, args, isNot);
        else if (prop === 'toHaveReturned')
          return () =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toHaveReturned(value as (...args: any[]) => any, isNot));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toHaveReturned(value as (...args: any[]) => any, isNot);
        else if (prop === 'toHaveReturnedTimes')
          return (expected: number) =>
            isEventually
              ? new Promise((resolve, reject) => {
                  Promise.resolve(value)
                    .then((value) => {
                      try {
                        resolve(testAdapter.expect.toHaveReturnedTimes(value, expected, isNot));
                      } catch (error) {
                        reject(error);
                      }
                    })
                    .catch(reject);
                })
              : testAdapter.expect.toHaveReturnedTimes(value, expected, isNot);
        if (prop === 'not') return getExpect<TValue, true>(value, testAdapter, true, false);
        if (prop === 'eventually') return getExpect<TValue, TIsNot, true>(value, testAdapter, isNot, true);

        throw new Error(`Expect.${String(prop)} is not a function`);
      }
    }
  ) as Expect<TValue, TIsNot>;
}
