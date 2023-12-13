import { Narrow } from '@palmares/core';

import { getDefaultAdapter } from '../conf';
import Schema from './schema';
import {
  defaultTransform,
  getTranslatedSchemaFromAdapter,
  transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas,
} from '../utils';

import type FieldAdapter from '../adapter/fields';
import type { DefinitionsOfSchemaType } from './types';
import { unionValidation } from '../validators/union';
import Validator from '../validators/utils';

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
  TSchemas extends readonly Schema[] = Schema[],
> extends Schema<TType, TDefinitions> {
  protected __schemas = new Set<Schema<any>>();

  constructor(schemas: TSchemas) {
    super();
    this.__schemas = new Set(schemas);
  }

  async _transformToAdapter(
    options: Parameters<Schema['_transformToAdapter']>[0]
  ): Promise<ReturnType<FieldAdapter['translate']>> {
    const translatedSchemaOfAdapter = getTranslatedSchemaFromAdapter(this.__adapter, 'union');

    if (translatedSchemaOfAdapter === undefined) {
      const promises: Promise<any>[] = [];
      let shouldHandleByFallback = this.__adapter.union === undefined; // SHould handle by fallback if the adapter does not have a union adapter
      for (const schemaToTransform of this.__schemas.values()) {
        const awaitableTransformer = async () => {
          const [transformedData, shouldAddFallbackValidationForThisKey] =
            await transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas(schemaToTransform, {
              ...options,
              modifyItself: (schema) => {
                schema.__adapter.field.__result = undefined;
              },
            });
          if (shouldAddFallbackValidationForThisKey) shouldHandleByFallback = true;
          return transformedData;
        };
        promises.push(awaitableTransformer());
      }
      const transformedSchemas = await Promise.all(promises);
      if (shouldHandleByFallback) Validator.createAndAppendFallback(this, unionValidation(Array.from(this.__schemas)));

      return defaultTransform(
        'union',
        this,
        {
          nullable: this.__nullable,
          optional: this.__optional,
          schemas: transformedSchemas,
        },
        {},
        { fallbackTranslatedSchema: transformedSchemas[0] }
      );
    }
    return translatedSchemaOfAdapter;
  }

  static new<
    TSchemas extends readonly Schema<any, any>[],
    TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
  >(schemas: Narrow<TSchemas>): UnionSchema<TSchemas[number]['__types']> {
    const result = new UnionSchema<TSchemas[number]['__types'], TDefinitions, TSchemas>(schemas as TSchemas);

    const DefaultAdapterClass = getDefaultAdapter();
    const adapterInstance = new DefaultAdapterClass();
    result.__adapter = adapterInstance;

    return result;
  }
}
