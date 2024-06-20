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

  protected async _transformToAdapter(
    options: Parameters<Schema['__transformToAdapter']>[0]
  ): Promise<ReturnType<FieldAdapter['translate']>> {
    return await defaultTransformToAdapter(
      async (adapter) => {
        const promises: Promise<any>[] = [];
        const shouldBeHighPriorityFallback = adapter.union === undefined;
        const transformedSchemasAsString: string[] = [];
        const transformedSchemas: any[] = [];
        let shouldBeHandledByFallback = shouldBeHighPriorityFallback;

        for (const schemaToTransform of this.__schemas.values()) {
          const awaitableTransformer = async () => {
            const [transformedData, shouldAddFallbackValidationForThisKey] =
              await transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas(schemaToTransform, options);
            if (shouldAddFallbackValidationForThisKey) shouldBeHandledByFallback = true;

            for (const transformedSchema of transformedData) {
              transformedSchemasAsString.push(transformedSchema.asString);
              transformedSchemas.push(transformedSchema.transformed);
            }
          };
          promises.push(awaitableTransformer());
        }

        if (shouldBeHandledByFallback) {
          Validator.createAndAppendFallback(
            this,
            unionValidation(
              Array.from(this.__schemas) as unknown as readonly [
                Schema<any, any>,
                Schema<any, any>,
                ...Schema<any, any>[],
              ]
            ),
            {
              at: 0,
              removeCurrent: true,
            }
          );
        }

        await Promise.all(promises);
        return defaultTransform(
          'union',
          this,
          adapter,
          adapter.union,
          (isStringVersion) => ({
            nullable: this.__nullable,
            optional: this.__optional,
            schemas: isStringVersion ? transformedSchemasAsString : transformedSchemas,
            parsers: {
              nullable: this.__nullable.allow,
              optional: this.__optional.allow,
            },
          }),
          {},
          {
            shouldAddStringVersion: options.shouldAddStringVersion,
            fallbackIfNotSupported: async () => {
              if (options.appendFallbacksBeforeAdapterValidation)
                options.appendFallbacksBeforeAdapterValidation(
                  'union',
                  async (adapter, fieldAdapter, schema, translatedSchemas, value, path, options) => {
                    const parsedValues = {
                      parsed: value,
                      errors: [],
                    } as { parsed: any; errors: any[] };
                    //                    const initialErrorsAsHashedSet = new Set(Array.from(options.errorsAsHashedSet || []));
                    for (const translatedSchema of translatedSchemas) {
                      //options.errorsAsHashedSet = initialErrorsAsHashedSet;
                      const { parsed, errors } = await schema.__validateByAdapter(
                        adapter,
                        fieldAdapter,
                        translatedSchema,
                        value,
                        path,
                        options
                      );

                      if ((errors || []).length <= 0) return { parsed, errors };
                      else {
                        parsedValues.parsed = parsed;
                        parsedValues.errors = (parsedValues.errors || []).concat(errors || []);
                      }
                    }
                    return parsedValues;
                  }
                );

              const transformedSchemasAsPromises = [];
              for (const schema of this.__schemas)
                transformedSchemasAsPromises.push((schema as any).__transformToAdapter(options));

              console.log((await Promise.all(transformedSchemasAsPromises)).flat());
              return (await Promise.all(transformedSchemasAsPromises)).flat();
            },
          }
        );
      },
      this.__transformedSchemas,
      options,
      'union'
    );
  }

  static new<
    TSchemas extends readonly [Schema<any, any>, Schema<any, any>, ...Schema<any, any>[]],
    TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
  >(schemas: Narrow<TSchemas>): UnionSchema<TSchemas[number] extends Schema<infer TType, any> ? TType : never> {
    const returnValue = new UnionSchema<TSchemas[number] extends Schema<infer TType, any> ? TType : never, TDefinitions, TSchemas>(schemas as TSchemas);

    const adapterInstance = getDefaultAdapter();

    returnValue.__transformedSchemas[adapterInstance.constructor.name] = {
      transformed: false,
      adapter: adapterInstance,
      schemas: [],
    };
    return returnValue as any;
  }
}

export const union = UnionSchema.new;
