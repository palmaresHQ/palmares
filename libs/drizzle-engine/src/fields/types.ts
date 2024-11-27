export type CustomArgs<TParamsOfColumnTypes, TReturnTypeOfColumnTypes> = {
  args?: TParamsOfColumnTypes;
  options?: {
    [TKey in keyof TReturnTypeOfColumnTypes as TReturnTypeOfColumnTypes[TKey] extends (...args: any) => any
      ? TKey
      : never]?:
      | Parameters<
          TReturnTypeOfColumnTypes[TKey] extends (...args: any) => any ? TReturnTypeOfColumnTypes[TKey] : never
        >
      | string[];
  };
};
