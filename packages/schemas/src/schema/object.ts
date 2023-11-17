import SchemaAdapter from '../adapter';
import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import FieldAdapter from '../adapter/fields';
import { withFallbackFactory } from '../utils';
import { objectValidation } from '../validators/object';

export default class ObjectSchema<
  TType extends {
    input: Record<any, any>;
    output: Record<any, any>;
  } = {
    input: Record<any, any>;
    output: Record<any, any>;
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
      const toInternalByKeys: Record<string, Schema['__toInternal']> = {};
      const toTransform = Object.entries(this.__data) as [string, Schema][];
      const transformedData: Record<any, any> = {};

      for (const [key, valueToTransform] of toTransform) {
        const awaitableTransformer = async () => {
          transformedData[key] = await valueToTransform._transform(); // This should come first because we will get the fallbacks of the field here.
          if (valueToTransform.__toInternal.length > 0) toInternalByKeys[key] = valueToTransform.__toInternal;
          if (valueToTransform.__fallback.length > 0) fallbackByKeys[key] = valueToTransform;
        };
        if (valueToTransform instanceof Schema) promises.push(awaitableTransformer());
      }

      await Promise.all(promises);

      const doesAnyFieldHaveFallback = Object.keys(fallbackByKeys).length > 0;
      console.log(fallbackByKeys);
      if (doesAnyFieldHaveFallback) this.__fallback.push(objectValidation(fallbackByKeys));
      this.__adapter.object.__result = this.__adapter.object.translate(this.__adapter.field, {
        withFallback: withFallbackFactory('object'),
        nullish: this.__nullish,
        data: transformedData,
      });
    }

    return this.__adapter.object.__result;
  }

  static new<TData extends Record<any, Schema>>(data: TData) {
    const returnValue = new ObjectSchema(data);
    const adapterInstance = new (getDefaultAdapter())();

    returnValue.__adapter = adapterInstance;

    return returnValue;
  }
}
