import FieldAdapter from '../adapter/fields';

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
  __validationSchema!: any;
  __refinements: {
    callback: (value: TType['input']) => Promise<boolean | { isValid: boolean; message: string }>;
    isAsync: boolean;
  }[] = [];
  __nullish!: {
    allowUndefined: boolean;
    message: string;
  };
  __toRepresentation!: (value: TType['output']) => TType['output'];
  __toInternal!: (value: TType['input']) => TType['input'];

  async validate(value: TType['input']): Promise<boolean> {
    return this.__validationSchema.validate(value);
  }

  async _transform(): Promise<ReturnType<FieldAdapter['translate']>> {
    throw new Error('Not implemented');
  }

  /**
   * This let's you refine the schema with custom validations. This is useful when you want to validate something that is not supported by default by the schema adapter.
   *
   * @param refinementCallback - The callback that will be called to validate the value.
   * @param options - Options for the refinement.
   * @param options.isAsync - Whether the callback is async or not. Defaults to true.
   */
  refine<TRefinedType extends TType>(
    refinementCallback: (value: TType['input']) => Promise<boolean | { isValid: boolean; message: string }>,
    options?: {
      isAsync?: boolean;
    }
  ) {
    const isAsync = typeof options?.isAsync === 'boolean' ? options.isAsync : true;

    this.__refinements.push({
      callback: refinementCallback,
      isAsync,
    });
    return this as unknown as Schema<TRefinedType, TDefinitions>;
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

  static new<TType extends { input: any; output: any }>(_args?: any): Schema<TType> {
    return new Schema<TType>();
  }
}
