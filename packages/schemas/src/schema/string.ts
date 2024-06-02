import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import { defaultTransform, defaultTransformToAdapter } from '../utils';
import {
  maxLength,
  datetime,
  includes,
  minLength,
  endsWith,
  regex,
  startsWith,
  stringValidation,
} from '../validators/string';
import { DefinitionsOfSchemaType } from './types';
import Validator from '../validators/utils';

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
  protected __datetime!: {
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

  async _transformToAdapter(options: Parameters<Schema['_transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        Validator.createAndAppendFallback(this, stringValidation());
        return defaultTransform(
          'string',
          this,
          adapter,
          adapter.string,
          async () => ({
            datetime: this.__datetime,
            minLength: this.__minLength,
            maxLength: this.__maxLength,
            regex: this.__regex,
            endsWith: this.__endsWith,
            startsWith: this.__startsWith,
            includes: this.__includes,
            nullable: this.__nullable,
            optional: this.__optional,
          }),
          {
            maxLength,
            minLength,
            endsWith,
            startsWith,
            regex,
            includes,
            datetime,
          },
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

  datetime(options?: Partial<StringSchema['__datetime']>) {
    this.__datetime = {
      message: options?.message || 'The value should be a valid datetime string',
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

    return returnValue as StringSchema<
      {
        input: string;
        output: string;
        internal: string;
        representation: string;
        validate: string;
      },
      TDefinitions
    >;
  }
}
