type Narrowable = string | number | bigint | boolean;

export type NarrowRaw<A> =
  | (A extends [] ? [] : never)
  | (A extends Narrowable ? A : never)
  | {
      // eslint-disable-next-line @typescript-eslint/ban-types
      [K in keyof A]: A[K] extends Function ? A[K] : NarrowRaw<A[K]>;
    };

type Try<A1, A2, Catch = never> = A1 extends A2 ? A1 : Catch;

export type Narrow<A> = Try<A, [], NarrowRaw<A>>;
