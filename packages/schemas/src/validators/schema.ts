import { ErrorCodes } from '../adapter/types';
import Schema from '../schema/schema';
import { ValidationFallbackReturnType } from '../schema/types';

export function optional(args: Schema['__optional']): ValidationFallbackReturnType {
  return {
    type: 'high',
    callback: async (value: any, path: (string | number)[]) => {
      if (value === undefined) {
        if (args?.allow === true)
          return {
            parsed: value,
            errors: [],
            preventChildValidation: true,
          };
        return {
          parsed: value,
          errors: [
            {
              isValid: false,
              message: args.message,
              code: 'required' as ErrorCodes,
              path: path || [],
            },
          ],
          preventChildValidation: true,
        };
      }

      return {
        parsed: value,
        errors: [],
        preventChildValidation: false,
      };
    },
  };
}

export function nullable(args: Schema['__nullable']): ValidationFallbackReturnType {
  return {
    type: 'high',
    callback: async (value: any, path: (string | number)[]) => {
      if (value === null) {
        if (args?.allow === true)
          return {
            parsed: value,
            errors: [],
            preventChildValidation: true,
          };
        return {
          parsed: value,
          errors: [
            {
              isValid: false,
              message: args?.message,
              code: 'cannot_be_null' as ErrorCodes,
              path: path || [],
            },
          ],
          preventChildValidation: true,
        };
      }

      return {
        parsed: value,
        errors: [],
        preventChildValidation: false,
      };
    },
  };
}

export function checkType(args: Schema['__type']): ValidationFallbackReturnType {
  return {
    type: 'medium',
    callback: async (value: any, path: (string | number)[]) => {
      if (args.check(value))
        return {
          parsed: value,
          errors: [],
          preventChildValidation: false,
        };

      return {
        parsed: value,
        errors: [
          {
            isValid: false,
            message: args.message,
            code: 'invalid_type' as ErrorCodes,
            path: path || [],
          },
        ],
        preventChildValidation: true,
      };
    },
  };
}
