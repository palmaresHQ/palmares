import { SchemaAdapterNotImplementedError } from '../../exceptions';

import type { SupportedSchemas } from '../../types';
import type WithFallback from '../../utils';
import type SchemaAdapter from '../index';
import type { AdapterToStringArgs, AdapterTranslateArgs, ErrorCodes } from '../types';

export function fieldAdapter<
  TTranslate extends FieldAdapter['translate'],
  TToString extends FieldAdapter['toString'],
  TFormatError extends FieldAdapter['formatError'],
  TParse extends FieldAdapter['parse']
>(args: {
  translate: TTranslate;
  toString?: TToString;
  formatError?: TFormatError;
  parse?: TParse;
}) {
  class CustomFieldAdapter extends FieldAdapter {
    translate = args.translate;
    toString = args.toString as TToString;
    formatError = args.formatError as TFormatError;
    parse = args.parse as TParse;
  }

  return CustomFieldAdapter as typeof FieldAdapter & {
    new (): FieldAdapter & {
      translate: TTranslate;
      toString: TToString;
      formatError: TFormatError;
      parse: TParse;
    }
  }
}
export default class FieldAdapter {
  translate(_fieldAdapter: FieldAdapter, _args: AdapterTranslateArgs<SupportedSchemas>, _base?: any): any | WithFallback<SupportedSchemas> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'translate' });
  }

  parse(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter,
    _result: any,
    _value: any,
    _args: Omit<AdapterTranslateArgs<SupportedSchemas>, 'withFallback'>,
  ): Promise<{ errors: any; parsed: any }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'parse' });
  }

  toString(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter,
    _args: AdapterToStringArgs,
    _base?: any
  ): Promise<string> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'toString' });
  }

  // eslint-disable-next-line ts/require-await
  async formatError(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter,
    _error: any,
    _metadata?: any
  ): Promise<{
    message: string;
    path: (string | number)[];
    code: ErrorCodes;
  }> {
    throw new SchemaAdapterNotImplementedError({ className: this.constructor.name, functionName: 'formatError' });
  }
}
