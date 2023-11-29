import NumberSchema from '../schema/number';
import Schema from '../schema/schema';
import { ValidationFallbackReturnType } from '../schema/types';

export function max(args: NumberSchema['__max']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['_transformToAdapter']>[0]) => {
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
    },
  };
}

export function min(args: NumberSchema['__min']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value: any, path?: (string | number)[]) => {
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
    },
  };
}
