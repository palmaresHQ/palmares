import NumberSchema from '../schema/number';
import Schema from '../schema/schema';
import { ValidationFallbackType } from '../schema/types';

export function max(args: NumberSchema['__max']) {
  return async (
    value: any,
    path: (string | number)[],
    _options: Parameters<Schema['_transformToAdapter']>[0]
  ): Promise<ValidationFallbackType> => {
    if (typeof value !== 'number')
      return {
        parsed: value,
        errors: [
          {
            isValid: false,
            code: 'number',
            path: path || [],
            message: args.message,
          },
        ],
      };
    if (args.inclusive)
      return {
        parsed: value,
        errors: [
          {
            isValid: value <= args.value,
            code: 'number',
            path: path || [],
            message: args.message,
          },
        ],
      };

    return {
      parsed: value,
      errors: [
        {
          isValid: value <= args.value,
          code: 'number',
          path: path || [],
          message: args.message,
        },
      ],
    };
  };
}

export function min(args: NumberSchema['__min']) {
  return async (value: any, path?: (string | number)[]): Promise<ValidationFallbackType> => {
    if (typeof value !== 'number')
      return {
        parsed: value,
        errors: [
          {
            isValid: false,
            message: args.message,
            code: 'number',
            path: path || [],
          },
        ],
      };
    if (args.inclusive)
      return {
        parsed: value,
        errors: [
          {
            isValid: value >= args.value,
            message: args.message,
            code: 'min',
            path: path || [],
          },
        ],
      };

    return {
      parsed: value,
      errors: [
        {
          isValid: value >= args.value,
          message: args.message,
          code: 'min',
          path: path || [],
        },
      ],
    };
  };
}
