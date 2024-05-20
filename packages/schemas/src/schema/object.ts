import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import FieldAdapter from '../adapter/fields';
import {
  defaultTransform,
  getTranslatedSchemaFromAdapter,
  transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas,
} from '../utils';
import { objectValidation } from '../validators/object';
import { DefinitionsOfSchemaType, ExtractTypeFromObjectOfSchemas } from './types';
import Validator from '../validators/utils';

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
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
  TData extends Record<any, any> = Record<any, any>,
> extends Schema<TType, TDefinitions> {
  protected __data: Record<any, Schema>;
  protected __cachedDataAsEntries!: [string, Schema][];

  constructor(data: TData) {
    super();
    this.__data = data;
  }

  protected __retrieveDataAsEntriesAndCache(): [string, Schema][] {
    const dataAsEntries = Array.isArray(this.__cachedDataAsEntries)
      ? this.__cachedDataAsEntries
      : (Object.entries(this.__data) as [string, Schema][]);
    this.__cachedDataAsEntries = dataAsEntries;
    return this.__cachedDataAsEntries;
  }

  async _transformToAdapter(
    options: Parameters<Schema['_transformToAdapter']>[0]
  ): Promise<ReturnType<FieldAdapter['translate']>> {
    const translatedSchemaOfAdapter = getTranslatedSchemaFromAdapter(
      this.__adapters[options.validationKey as symbol],
      'object'
    );
    if (translatedSchemaOfAdapter === undefined) {
      const promises: Promise<any>[] = [];
      const fallbackByKeys: Record<string, Schema> = {};

      const toTransform = this.__retrieveDataAsEntriesAndCache();

      const transformedDataByKeys: Record<any, any> = {};

      let shouldValidateWithFallback = false;

      for (const [key, valueToTransform] of toTransform) {
        const awaitableTransformer = async () => {
          const [transformedData, shouldAddFallbackValidationForThisKey] =
            await transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas(
              valueToTransform,
              options
              /*modifyItself: async (schema, validationKey) => {
                // Pretty much when we are transforming the data we need to make sure that we create a fresh new instance of the adapter.
                // We do that because we only assign the adapter
                const DefaultAdapterClass = getDefaultAdapter();
                const adapterInstance = new DefaultAdapterClass();
                this.__adapters[validationKey as symbol] = adapterInstance;

                const copiedTransformedDataByKeys = {} as typeof transformedDataByKeys;
                for (const [key, value] of Object.entries(transformedDataByKeys))
                  copiedTransformedDataByKeys[key] = value;

                const newTranslatedSchema = await schema._transformToAdapter({
                  ...options,
                  validationKey: validationKey,
                });
                copiedTransformedDataByKeys[key] = newTranslatedSchema;

                await defaultTransform(
                  'object',
                  this,
                  {
                    data: copiedTransformedDataByKeys,
                    nullable: this.__nullable,
                    optional: this.__optional,
                  },
                  {},
                  {
                    force: true,
                    validationKey: validationKey,
                  }
                );
                await options.modifyItself?.(this, validationKey);
              },
            }*/
            );
          shouldValidateWithFallback = shouldValidateWithFallback || shouldAddFallbackValidationForThisKey;

          if (shouldAddFallbackValidationForThisKey) fallbackByKeys[key] = valueToTransform;

          transformedDataByKeys[key] = transformedData;
        };
        if (valueToTransform instanceof Schema) promises.push(awaitableTransformer());
      }

      await Promise.all(promises);
      if (shouldValidateWithFallback)
        Validator.createAndAppendFallback(this, objectValidation(fallbackByKeys), { at: 0, removeCurrent: true });
      return defaultTransform(
        'object',
        this,
        {
          data: transformedDataByKeys,
          nullable: this.__nullable,
          optional: this.__optional,
        },
        {},
        {
          validationKey: options.validationKey as symbol,
        }
      );
    }

    console.log('object Transform to adapter', this.constructor.name, translatedSchemaOfAdapter);
    return translatedSchemaOfAdapter;
  }

  protected async __parse(
    value: TType['input'],
    path: (string | number)[] = [],
    options: Parameters<Schema['_transformToAdapter']>[0]
  ): Promise<{ errors?: any[]; parsed: TType['internal'] }> {
    let isRoot = options.toInternalToBubbleUp === undefined;

    await this._transformToAdapter(options);

    if (isRoot) options.toInternalToBubbleUp = [];

    const result = await super.__parse(value, path, options);

    const hasNoErrors = result.errors === undefined || (result.errors || []).length === 0;
    if (isRoot && hasNoErrors)
      for (const functionToModifyResult of options.toInternalToBubbleUp || []) await functionToModifyResult();
    return result;
  }

  /**
   * Transform the data to the representation without validating it. This is useful when you want to return a data from a query directly to the user. The core idea of this is that you can join the data
   * from the database "by hand". In other words, you can do the joins by yourself directly on code. For more complex cases, this can be really helpful.
   *
   * @param value - The value to be transformed.
   */
  async _transform(value: TType['output']): Promise<TType['representation']> {
    const dataAsEntries = this.__retrieveDataAsEntriesAndCache();
    const isValueAnObject = typeof value === 'object' && value !== null;

    if (!isValueAnObject) return value;

    await Promise.all(
      dataAsEntries.map(async ([key, valueToTransform]) => {
        const isValueToTransformASchemaAndNotUndefined =
          valueToTransform instanceof Schema && (value[key] !== undefined || valueToTransform.__defaultFunction);
        if (isValueToTransformASchemaAndNotUndefined) {
          const transformedValue = await valueToTransform._transform(value[key]);
          (value as any)[key] = transformedValue;
        }
      })
    );
    value = await super._transform(value);

    return value;
  }

  static new<TData extends Record<any, Schema>, TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType>(
    data: TData
  ) {
    const returnValue = new ObjectSchema<
      {
        input: ExtractTypeFromObjectOfSchemas<TData, 'input'>;
        validate: ExtractTypeFromObjectOfSchemas<TData, 'validate'>;
        internal: ExtractTypeFromObjectOfSchemas<TData, 'internal'>;
        representation: ExtractTypeFromObjectOfSchemas<TData, 'representation'>;
        output: ExtractTypeFromObjectOfSchemas<TData, 'output'>;
      },
      TDefinitions,
      TData
    >(data);

    const DefaultAdapterClass = getDefaultAdapter();
    const adapterInstance = new DefaultAdapterClass();

    returnValue.__adapters.default = adapterInstance;

    return returnValue;
  }
}
