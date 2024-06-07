import { Narrow } from '@palmares/core';

import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import { defaultTransform, defaultTransformToAdapter } from '../utils';
import { DefinitionsOfSchemaType, ExtractTypeFromArrayOfSchemas } from './types';
import Validator from '../validators/utils';
import StringSchema from './string';
import NumberSchema from './number';

export default class ArraySchema<
  TType extends {
    input: any[];
    validate: any[];
    internal: any[];
    output: any[];
    representation: any[];
  } = {
    input: any[];
    output: any[];
    internal: any[];
    representation: any[];
    validate: any[];
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
  TSchemas extends readonly [Schema, ...Schema[]] | [Array<Schema>] = [Array<Schema>],
> extends Schema<TType, TDefinitions> {
  protected __schemas: readonly [Schema, ...Schema[]] | [Array<Schema>];

  protected __includes!: {
    value: string;
    message: string;
  };

  protected __minLength!: {
    value: number;
    inclusive: boolean;
    message: string;
  };

  protected __maxLength!: {
    value: number;
    inclusive: boolean;
    message: string;
  };

  protected __nonEmpty!: {
    message: string;
  };

  constructor(...schemas: TSchemas) {
    super();
    this.__schemas = schemas;
  }

  async _transformToAdapter(options: Parameters<Schema['_transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        return defaultTransform(
          'array',
          this,
          adapter,
          adapter.array,
          () => ({
            isTuple: Array.isArray(this.__schemas[0]) === false,
            nullable: this.__nullable,
            optional: this.__optional,
            maxLength: this.__maxLength,
            minLength: this.__minLength,
            nonEmpty: this.__nonEmpty,
          }),
          {},
          {
            shouldAddStringVersion: options.shouldAddStringVersion,
            fallbackIfNotSupported: async () => {
              return [];
            },
          }
        );
      },
      this.__transformedSchemas,
      options,
      'number'
    );
  }

  static new<
    TSchemas extends readonly [Schema, ...Schema[]] | [Array<Schema>],
    TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
  >(...schemas: TSchemas) {
    const returnValue = new ArraySchema<
      {
        input: ExtractTypeFromArrayOfSchemas<TSchemas, 'input'>;
        validate: ExtractTypeFromArrayOfSchemas<TSchemas, 'validate'>;
        internal: ExtractTypeFromArrayOfSchemas<TSchemas, 'internal'>;
        output: ExtractTypeFromArrayOfSchemas<TSchemas, 'output'>;
        representation: ExtractTypeFromArrayOfSchemas<TSchemas, 'representation'>;
      },
      TDefinitions,
      TSchemas
    >(...schemas);

    const adapterInstance = getDefaultAdapter();

    returnValue.__transformedSchemas[adapterInstance.constructor.name] = {
      transformed: false,
      adapter: adapterInstance,
      schemas: [],
    };

    return returnValue;
  }
}
