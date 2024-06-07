import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import FieldAdapter from '../adapter/fields';
import {
  defaultTransform,
  defaultTransformToAdapter,
  transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas,
} from '../utils';
import { objectValidation } from '../validators/object';
import { DefinitionsOfSchemaType, ExtractTypeFromObjectOfSchemas, OnlyFieldAdaptersFromSchemaAdapter } from './types';
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
    return defaultTransformToAdapter(
      async (adapter) => {
        const promises: Promise<any>[] = [];
        const fallbackByKeys: Record<string, Schema> = {};

        const toTransform = this.__retrieveDataAsEntriesAndCache();

        // This is needed because we will create other objects based this one by reference
        const transformedDataByKeys = {
          transformed: {},
          asString: {},
        } as { transformed: Record<any, any>; asString: Record<any, string> };
        const transformedDataByKeysArray: { transformed: Record<any, any>; asString: Record<any, string> }[] = [
          transformedDataByKeys,
        ];

        let shouldValidateWithFallback = false;

        for (const [key, valueToTransform] of toTransform) {
          const awaitableTransformer = async () => {
            const [transformedDataAndString, shouldAddFallbackValidationForThisKey] =
              await transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas(valueToTransform, options);
            shouldValidateWithFallback = shouldValidateWithFallback || shouldAddFallbackValidationForThisKey;

            if (shouldAddFallbackValidationForThisKey) fallbackByKeys[key] = valueToTransform;

            const lengthOfTransformedKeysArray = transformedDataByKeysArray.length;
            for (
              let transformedDataByKeysIndex = 0;
              transformedDataByKeysIndex < lengthOfTransformedKeysArray;
              transformedDataByKeysIndex++
            ) {
              for (
                let transformedDataIndex = 0;
                transformedDataIndex < transformedDataAndString.length;
                transformedDataIndex++
              ) {
                const indexOnTransformedDataByKeys = (transformedDataByKeysIndex + 1) * transformedDataIndex;

                if (transformedDataByKeysArray[indexOnTransformedDataByKeys] === undefined)
                  transformedDataByKeysArray[indexOnTransformedDataByKeys] = {
                    transformed: { ...transformedDataByKeys.transformed },
                    asString: { ...transformedDataByKeys.asString },
                  };
                transformedDataByKeysArray[indexOnTransformedDataByKeys].transformed[key] =
                  transformedDataAndString[transformedDataIndex].transformed;

                transformedDataByKeysArray[indexOnTransformedDataByKeys].asString[key] =
                  transformedDataAndString[transformedDataIndex].asString;
              }
            }
          };
          if (valueToTransform instanceof Schema) promises.push(awaitableTransformer());
        }

        await Promise.all(promises);

        if (shouldValidateWithFallback)
          Validator.createAndAppendFallback(this, objectValidation(fallbackByKeys), { at: 0, removeCurrent: true });

        return (
          await Promise.all(
            transformedDataByKeysArray.map(({ transformed, asString }) =>
              defaultTransform(
                'object',
                this,
                adapter,
                adapter.object,
                (isStringVersion) => ({
                  data: isStringVersion ? asString : transformed,
                  nullable: this.__nullable,
                  optional: this.__optional,
                }),
                {},
                {
                  shouldAddStringVersion: options.shouldAddStringVersion,
                }
              )
            )
          )
        ).flat();
      },
      this.__transformedSchemas,
      options,
      'object'
    );
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

    const adapterInstance = getDefaultAdapter();

    returnValue.__transformedSchemas[adapterInstance.constructor.name] = {
      transformed: false,
      adapter: adapterInstance,
      schemas: [],
    };

    return returnValue;
  }
}
