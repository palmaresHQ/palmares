type Narrowable = string | number | bigint | boolean;

export type NarrowRaw<T> =
  | (T extends [] ? [] : never)
  | (T extends Narrowable ? T : never)
  | {
      // eslint-disable-next-line ts/ban-types
      [K in keyof T]: T[K] extends Function ? T[K] : NarrowRaw<T[K]>;
    };

type Try<TDataOne, TDataTwo, TCatch = never> = TDataOne extends TDataTwo ? TDataOne : TCatch;

export type Narrow<T> = Try<T, [], NarrowRaw<T>>;
