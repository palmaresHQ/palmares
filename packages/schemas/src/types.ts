import Schema from './schema/schema';
import { ValidatorTypes } from './validators/types';

export type MaybePromise<T> = T | Promise<T>;

export type FallbackFunctionsType<TArguments> = {
  [TKey in keyof TArguments]?: (args: NonNullable<TArguments[TKey]>) => {
    type: ValidatorTypes;
    callback: NonNullable<Schema['__rootFallbacksValidator']['fallbacks'][number]>;
  };
};