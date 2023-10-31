export class Schema<
  TDefinitions,
  TType extends {
    input: any;
    output: any;
  } = {
    input: any;
    output: any;
  },
> {
  __validationSchema: any;
  __toRepresentation!: (value: TType['output']) => TType['output'];
  __toInternal!: (value: TType['input']) => TType['input'];

  constructor(validationSchema: any) {
    this.__validationSchema = validationSchema;
  }

  validate(value: TType['input']) {
    return this.__validationSchema.validate(value);
  }

  toRepresentation<TOutput>(toRepresentationCallback: (value: TType['output']) => TOutput) {
    this.__toRepresentation = toRepresentationCallback;
    return this as unknown as Schema<TDefinitions, { input: TType['input']; output: TOutput }>;
  }

  toInternal<TInput>(toInternalCallback: (value: TType['input']) => TInput) {
    this.__toInternal = toInternalCallback;
    return this as unknown as Schema<TDefinitions, { input: TInput; output: TType['output'] }>;
  }

  static new<TDefinitions, TType extends { input: any; output: any }>(
    definitions: TDefinitions
  ): Schema<TDefinitions, TType> {
    return new Schema<TDefinitions, TType>(undefined);
  }
}

export class NumberSchema<
  TDefinitions,
  TType extends {
    input: number | bigint;
    output: number | bigint;
  } = {
    input: number | bigint;
    output: number | bigint;
  },
> extends Schema<TDefinitions, TType> {}
