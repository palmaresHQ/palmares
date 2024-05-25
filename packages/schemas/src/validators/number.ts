import NumberSchema from '../schema/number';
import Schema from '../schema/schema';
import { ValidationFallbackReturnType } from '../schema/types';

export function numberValidation(): ValidationFallbackReturnType {
  return {
    type: 'high',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['_transformToAdapter']>[0]) => {
      return {
        parsed: value,
        errors: [
          {
            isValid: typeof value === 'number',
            code: 'number',
            path: path || [],
            message: 'The value must be a number. Received: ' + typeof value,
          },
        ],
      };
    },
  };
}

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
