export default class Schema<
  TType extends {
    input: any;
    output: any;
  } = {
    input: any;
    output: any;
  },
  TDefinitions = any,
> {
  __validationSchema: any;

  __nullish!: {
    allowUndefined: boolean;
    message: string;
  };
  __toRepresentation!: (value: TType['output']) => TType['output'];
  __toInternal!: (value: TType['input']) => TType['input'];

  constructor(validationSchema: any) {
    this.__validationSchema = validationSchema;
  }

  async validate(value: TType['input']): Promise<boolean> {
    return this.__validationSchema.validate(value);
  }

  nullish(args: { allowUndefined?: boolean; message?: string } = {}) {
    return this as unknown as Schema<
      { input: TType['input'] | null; output: TType['output'] | null | undefined },
      TDefinitions
    >;
  }

  toRepresentation<TOutput>(toRepresentationCallback: (value: TType['output']) => Promise<TOutput>) {
    this.__toRepresentation = toRepresentationCallback;
    return this as unknown as Schema<{ input: TType['input']; output: TOutput }, TDefinitions>;
  }

  toInternal<TInput>(toInternalCallback: (value: TType['input']) => Promise<TInput>) {
    this.__toInternal = toInternalCallback;
    return this as unknown as Schema<{ input: TInput; output: TType['output'] }, TDefinitions>;
  }

  static new<TType extends { input: any; output: any }>(): Schema<TType> {
    return new Schema<TType>(undefined);
  }
}
