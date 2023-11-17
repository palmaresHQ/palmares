import Schema from './schema/schema';

export type FallbackFunctionsType<TArguments> = {
  [TKey in keyof TArguments]?: (args: NonNullable<TArguments[TKey]>) => Schema['__fallback'][number];
};
