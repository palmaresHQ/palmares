import SchemaAdapter from '../adapter';
import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import FieldAdapter from '../adapter/fields';
import { withFallbackFactory } from '../utils';
import { objectValidation } from '../validators/object';

export default class ObjectSchema<
  TType extends {
    input: Record<any, any>;
    validate: Record<any, any>;
    internal: Record<any, any>;
    representation: Record<any, any>;
    output: Record<any, any>;
  } = {
    input: Record<any, any>;
    output: Record<any, any>;
    validate: Record<any, any>;
    internal: Record<any, any>;
    representation: Record<any, any>;
  },
  TData extends Record<any, any> = Record<any, any>,
> extends Schema<TType> {
  protected __data!: Record<any, any>;

  constructor(data: TData) {
    super();
    this.__data = data;
  }

  async _transform(): Promise<ReturnType<FieldAdapter['translate']>> {
    if (!this.__adapter.object.__result) {
      const promises: Promise<any>[] = [];
      const fallbackByKeys: Record<string, Schema> = {};

      const toTransform = Object.entries(this.__data) as [string, Schema][];
      const transformedData: Record<any, any> = {};

      let shouldValidateWithFallback = false;

      for (const [key, valueToTransform] of toTransform) {
        const awaitableTransformer = async () => {
          const valueToTransformWithProtected = valueToTransform as Schema & {
            __toInternal: Schema['__toInternal'];
            __toValidate: Schema['__toValidate'];
            __toRepresentation: Schema['__toRepresentation'];
            __defaultFunction: Schema['__defaultFunction'];
            __fallback: Schema['__fallback'];
          };
          transformedData[key] = await valueToTransform._transform(); // This should come first because we will get the fallbacks of the field here.
          const doesKeyHaveFallback = valueToTransformWithProtected.__fallback.length > 0;
          const doesKeyHaveToInternal = typeof valueToTransformWithProtected.__toInternal === 'function';
          const doesKeyHaveToValidate = typeof valueToTransformWithProtected.__toValidate === 'function';
          const doesKeyHaveToDefault = typeof valueToTransformWithProtected.__defaultFunction === 'function';
          const shouldAddFallbackValidationForThisKey =
            doesKeyHaveFallback || doesKeyHaveToInternal || doesKeyHaveToValidate || doesKeyHaveToDefault;
          shouldValidateWithFallback = shouldValidateWithFallback || shouldAddFallbackValidationForThisKey;

          if (shouldAddFallbackValidationForThisKey) fallbackByKeys[key] = valueToTransform;
        };
        if (valueToTransform instanceof Schema) promises.push(awaitableTransformer());
      }

      await Promise.all(promises);
      if (shouldValidateWithFallback) this.__fallback.push(objectValidation(fallbackByKeys));
      this.__adapter.object.__result = this.__adapter.object.translate(this.__adapter.field, {
        withFallback: withFallbackFactory('object'),
        nullish: this.__nullish,
        data: transformedData,
      });
    }

    return this.__adapter.object.__result;
  }

  async _parse(
    value: TType['input'],
    path: string[] = [],
    options: {
      preventAdapterParse?: boolean;
    } = {}
  ): Promise<{ errors?: any[]; parsed: TType['internal'] }> {
    await this._transform();
    const existsFallback = this.__fallback.length > 0;
    return super._parse(value, path, existsFallback ? { preventAdapterParse: true, ...options } : options);
  }

  static new<TData extends Record<any, Schema>>(data: TData) {
    const returnValue = new ObjectSchema(data);
    const adapterInstance = new (getDefaultAdapter())();

    returnValue.__adapter = adapterInstance;

    return returnValue;
  }
}
