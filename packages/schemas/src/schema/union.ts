import { Narrow } from '@palmares/core';

import { getDefaultAdapter } from '../conf';
import Schema from './schema';
import {
  defaultTransform,
  defaultTransformToAdapter,
  transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas,
} from '../utils';
import { unionValidation } from '../validators/union';
import Validator from '../validators/utils';

import type FieldAdapter from '../adapter/fields';
import type { DefinitionsOfSchemaType } from './types';

export default class UnionSchema<
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
  TSchemas extends readonly [Schema<any, any>, Schema<any, any>, ...Schema<any, any>[]] = [
    Schema<any, any>,
    Schema<any, any>,
    ...Schema<any, any>[],
  ],
> extends Schema<TType, TDefinitions> {
  protected __schemas = new Set<Schema<any>>();

  constructor(schemas: TSchemas) {
    super();
    this.__schemas = new Set(schemas);
  }

  async _transformToAdapter(
    options: Parameters<Schema['_transformToAdapter']>[0]
  ): Promise<ReturnType<FieldAdapter['translate']>> {
    return await defaultTransformToAdapter(
      async (adapter) => {
        const promises: Promise<any>[] = [];
        const shouldBeHighPriorityFallback = adapter.union === undefined;
        let shouldBeHandledByFallback = shouldBeHighPriorityFallback;
        for (const schemaToTransform of this.__schemas.values()) {
          const awaitableTransformer = async () => {
            const [transformedData, shouldAddFallbackValidationForThisKey] =
              await transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas(schemaToTransform, options);
            if (shouldAddFallbackValidationForThisKey) shouldBeHandledByFallback = true;
            return transformedData;
          };
          promises.push(awaitableTransformer());
        }

        if (shouldBeHighPriorityFallback && options.appendFallbacksBeforeAdapterValidation)
          options.appendFallbacksBeforeAdapterValidation('union', async (schemas, value, path) => {
            console.log('called the union fallback before adapter validation');
            return {
              parsed: value,
              errors: [],
            };
          });

        if (shouldBeHandledByFallback) {
          Validator.createAndAppendFallback(
            this,
            unionValidation(
              Array.from(this.__schemas) as unknown as readonly [
                Schema<any, any>,
                Schema<any, any>,
                ...Schema<any, any>[],
              ],
              false,
              options
            ),
            {
              at: 0,
              removeCurrent: true,
            }
          );
        }
        return defaultTransform(
          'union',
          this,
          {
            nullable: this.__nullable,
            optional: this.__optional,
            schemas: (await Promise.all(promises)).flat(),
          },
          {},
          { fallbackTranslatedSchema: (await Promise.all(promises)).flat()[0] }
        );
      },
      this.__transformedSchemas,
      options
    );
  }

  static new<
    TSchemas extends readonly [Schema<any, any>, Schema<any, any>, ...Schema<any, any>[]],
    TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
  >(schemas: Narrow<TSchemas>): UnionSchema<TSchemas[number]['__types']> {
    const returnValue = new UnionSchema<TSchemas[number]['__types'], TDefinitions, TSchemas>(schemas as TSchemas);

    const adapterInstance = getDefaultAdapter();

    returnValue.__transformedSchemas[adapterInstance.constructor.name] = {
      adapter: adapterInstance,
      schemas: [],
    };
    return returnValue;
  }
}
