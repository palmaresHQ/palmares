import SchemaAdapter from '../adapter';
import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import FieldAdapter from '../adapter/fields';

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
  protected __adapter!: SchemaAdapter;
  protected __data!: Record<any, any>;

  constructor(data: TData) {
    super();
    this.__data = data;
  }

  async _transform(): Promise<ReturnType<FieldAdapter['translate']>> {
    if (!this.__adapter.object.__result) {
      const promises = [];
      const toTransform = Object.entries(this.__data);
      const finalData: Record<any, any> = {};

      while (toTransform.length > 0) {
        const valueAndKeyToTransform = toTransform.shift();
        if (!valueAndKeyToTransform) break;
        const [key, valueToTransform] = valueAndKeyToTransform;
        const awaitableTransformer = async () => {
          finalData[key] = await valueToTransform._transform();
        };
        if (valueToTransform instanceof Schema) promises.push(awaitableTransformer());
      }

      await Promise.all(promises);

      this.__adapter.object.__result = this.__adapter.object.translate(this.__adapter.field, {
        nullish: this.__nullish,
        data: finalData,
      });
    }

    return this.__adapter.object.__result;
  }

  async _parse(input: TType['input']) {
    const transformedSchema = await this._transform();
    return this.__adapter.object.parse(this.__adapter, transformedSchema, input);
  }

  static new<TData extends Record<any, Schema>>(data: TData) {
    const returnValue = new ObjectSchema(data);
    const adapterInstance = new (getDefaultAdapter())();

    returnValue.__adapter = adapterInstance;

    return returnValue;
  }
}
