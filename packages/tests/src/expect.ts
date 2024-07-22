import type TestAdapter from "./adapter"

export type Expect<TValue, TIsNot extends boolean = false> = {
  not: Expect<TValue, true>
  toBe: <TToBeValue extends TValue>(expected: TToBeValue) => void
  toEqual: <TToEqualValue extends TValue>(expected: TToEqualValue) => void
  toStrictEqual: <TToEqualValue extends TValue>(expected: TToEqualValue) => void
  toBeInstanceOf: (expected: {
    new(...args: any[]): any
  }) => void;
  toBeTruthy: () => void;
  toBeFalsy: () => void;
}
&
(TValue extends undefined ? {
  toBeDefined: () => void,
  toBeUndefined: () => void
} : unknown)
&
(TValue extends null ? {
  toBeNull: () => void
} : unknown)
&
(TValue extends ((...args: any[]) => any) ? {
  toThrow: () => void;
  toHaveBeenCalled: () => void;
  toHaveBeenCalledTimes: (expected: number) => void;
  toHaveBeenCalledWith: (...args: Parameters<TValue>) => void;
  toHaveReturned: () => void;
  toHaveReturnedTimes: (expected: number) => void;
} : unknown)

export default function getExpect<
  TValue,
  TIsNot extends boolean = false
>(
  value: TValue,
  testAdapter: TestAdapter,
  isNot: TIsNot = false as TIsNot
): Expect<TValue, TIsNot> {
  return new Proxy({}, {
    get: (_, prop) => {
      if (prop === 'toBe')
        return <TToBeValue extends TValue>(expected: TToBeValue) => testAdapter.expect.toBe(value, expected, isNot);
      else if (prop === 'toEqual')
        return  <TToEqualValue extends TValue>(expected: TToEqualValue) => testAdapter.expect.toEqual(value, expected, isNot);
      else if (prop === 'toStrictEqual')
        return <TToEqualValue extends TValue>(expected: TToEqualValue) => testAdapter.expect.toStrictEqual(value, expected, isNot);
      else if (prop === 'toBeInstanceOf')
        return (expected: { new(...args: any[]): any }) => testAdapter.expect.toBeInstanceOf(value, expected, isNot);
      else if (prop === 'toBeDefined')
        return () => testAdapter.expect.toBeDefined(value, isNot);
      else if (prop === 'toHaveBeenCalled')
        return () => testAdapter.expect.toHaveBeenCalled(value, isNot);
      else if (prop === 'toHaveBeenCalledTimes')
        return (
          expected: number
        ) => testAdapter.expect.toHaveBeenCalledTimes(expected, isNot);
      else if (prop === 'toHaveBeenCalledWith')
        return (
          args: TValue extends ((...args: any[]) => any) ? Parameters<TValue> : [],
        ) => testAdapter.expect.toHaveBeenCalledWith(value, args, isNot);
      else if (prop === 'toHaveReturned')
        return () => testAdapter.expect.toHaveReturned(value as (...args: any[]) => any, isNot);
      else if (prop === 'toHaveReturnedTimes')
        return (
          expected: number
        ) => testAdapter.expect.toHaveReturnedTimes(value, expected, isNot);
      if (prop === 'not') return getExpect<TValue, true>(value, testAdapter, true);

      throw new Error(`Expect.${String(prop)} is not a function`)
    }
  }) as Expect<TValue, TIsNot>;
}
