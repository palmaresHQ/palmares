import type { ErrorCodes } from '../adapter/types';
import type BooleanSchema from '../schema/boolean';
import type NumberSchema from '../schema/number';
import type Schema from '../schema/schema';
import type StringSchema from '../schema/string';
import type { ValidationFallbackReturnType } from '../schema/types';

export function optional(args: Schema['__optional']): ValidationFallbackReturnType {
  return {
    name: 'optional',
    type: 'high',
    // eslint-disable-next-line ts/require-await
    callback: async (value: any, path: (string | number)[]) => {
      if (value === undefined) {
        if (args.allow === true)
          return {
            parsed: value,
            errors: [],
            preventChildValidation: true
          };
        return {
          parsed: value,
          errors: [
            {
              isValid: false,
              message: args.message,
              code: 'required' as ErrorCodes,
              // eslint-disable-next-line ts/no-unnecessary-condition
              path: path || []
            }
          ],
          preventChildValidation: true
        };
      }

      return {
        parsed: value,
        errors: [],
        preventChildValidation: false
      };
    }
  };
}

export function nullable(args: Schema['__nullable']): ValidationFallbackReturnType {
  return {
    name: 'nullable',
    type: 'high',
    // eslint-disable-next-line ts/require-await
    callback: async (value: any, path: (string | number)[]) => {
      if (value === null) {
        if (args.allow === true)
          return {
            parsed: value,
            errors: [],
            preventChildValidation: true
          };
        return {
          parsed: value,
          errors: [
            {
              isValid: false,
              message: args.message,
              code: 'null',
              // eslint-disable-next-line ts/no-unnecessary-condition
              path: path || []
            }
          ],
          preventChildValidation: true
        };
      }

      return {
        parsed: value,
        errors: [],
        preventChildValidation: false
      };
    }
  };
}

export function checkType(args: NonNullable<Schema['__type']>): ValidationFallbackReturnType {
  return {
    name: 'checkType',
    type: 'medium',
    // eslint-disable-next-line ts/require-await
    callback: async (value: any, path: (string | number)[]) => {
      if (args.check(value))
        return {
          parsed: value,
          errors: [],
          preventChildValidation: false
        };

      return {
        parsed: value,
        errors: [
          {
            isValid: false,
            message: args.message,
            code: 'invalid_type' as ErrorCodes,
            // eslint-disable-next-line ts/no-unnecessary-condition
            path: path || []
          }
        ],
        preventChildValidation: true
      };
    }
  };
}

export function is(
  args: NonNullable<BooleanSchema['__is']> | NonNullable<NumberSchema['__is']> | NonNullable<StringSchema['__is']>
): ValidationFallbackReturnType {
  return {
    name: 'is',
    type: 'medium',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = Array.isArray(args.value) ? args.value.includes(value as never) : value === args.value;
      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'is',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: 'Value is not a boolean'
              }
            ],
        preventChildValidation: true
      };
    }
  };
}
