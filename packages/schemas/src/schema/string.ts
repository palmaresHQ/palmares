import { Narrow } from '@palmares/core';

import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import { defaultTransform, defaultTransformToAdapter } from '../utils';
import { maxLength, includes, minLength, endsWith, regex, startsWith, stringValidation } from '../validators/string';
import { DefinitionsOfSchemaType } from './types';

export default class StringSchema<
  TType extends {
    input: any;
    validate: any;
    internal: any;
    output: any;
    representation: any;
  } = {
    input: string;
    output: string;
    internal: string;
    representation: string;
    validate: string;
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
> extends Schema<TType, TDefinitions> {
  protected __is!: {
    value: Narrow<TType['input'] | TType['input'][]>;
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

  protected __regex!: {
    value: RegExp;
    message: string;
  };
  protected __endsWith!: {
    value: string;
    message: string;
  };

  protected __startsWith!: {
    value: string;
    message: string;
  };

  protected __includes!: {
    value: string;
    message: string;
  };

  protected async __transformToAdapter(options: Parameters<Schema['__transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        return defaultTransform(
          'string',
          this,
          adapter,
          adapter.string,
          () => ({
            minLength: this.__minLength,
            maxLength: this.__maxLength,
            regex: this.__regex,
            endsWith: this.__endsWith,
            startsWith: this.__startsWith,
            includes: this.__includes,
            nullable: this.__nullable,
            optional: this.__optional,
            parsers: {
              nullable: this.__nullable.allow,
              optional: this.__optional.allow,
            }
          }),
          {
            maxLength,
            minLength,
            endsWith,
            startsWith,
            regex,
            includes,
          },
          {
            validatorsIfFallbackOrNotSupported: stringValidation(),
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

  is<const TValue extends TType['input'][]>(value: TValue) {
    this.__is = {
      value,
      message: `The value should be equal to ${value}`,
    };

    return this as any as Schema<
      {
        input: TValue[number];
        output: TValue[number];
        internal: TValue[number];
        representation: TValue[number];
        validate: TValue[number];
      },
      TDefinitions
    >;
  }

  endsWith(value: string, options?: Partial<Omit<StringSchema['__endsWith'], 'value'>>) {
    this.__endsWith = {
      value,
      message: options?.message || `The value should end with ${value}`,
    };
    return this;
  }

  startsWith(value: string, options?: Partial<Omit<StringSchema['__startsWith'], 'value'>>) {
    this.__startsWith = {
      value,
      message: options?.message || `The value should start with ${value}`,
    };
    return this;
  }

  includes(value: string, options?: Partial<Omit<StringSchema['__includes'], 'value'>>) {
    this.__includes = {
      value,
      message: options?.message || `The string value should include the following substring '${value}'`,
    };
    return this;
  }

  regex(value: RegExp, options?: Partial<Omit<StringSchema['__regex'], 'value'>>) {
    this.__regex = {
      value,
      message: options?.message || `The value should match the following regex '${value.toString()}'`,
    };
    return this;
  }

  maxLength(value: number, options?: Partial<Omit<StringSchema['__maxLength'], 'value'>>) {
    this.__maxLength = {
      value,
      message: options?.message || `The value should have a maximum length of ${value}`,
      inclusive: typeof options?.inclusive === 'boolean' ? options?.inclusive : false,
    };
    return this;
  }

  minLength(value: number, options?: Partial<Omit<StringSchema['__minLength'], 'value'>>) {
    this.__minLength = {
      value,
      message: options?.message || `The value should have a minimum length of ${value}`,
      inclusive: typeof options?.inclusive === 'boolean' ? options?.inclusive : false,
    };
    return this;
  }

  static new<TDefinitions extends DefinitionsOfSchemaType>() {
    const returnValue = new StringSchema<
      {
        input: string;
        output: string;
        internal: string;
        representation: string;
        validate: string;
      },
      TDefinitions
    >();
    const adapterInstance = getDefaultAdapter();

    returnValue.__transformedSchemas[adapterInstance.constructor.name] = {
      transformed: false,
      adapter: adapterInstance,
      schemas: [],
    };

    return returnValue;
  }
}

export const string = StringSchema.new;
