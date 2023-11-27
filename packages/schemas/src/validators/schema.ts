import { ErrorCodes } from '../adapter/types';
import Schema from '../schema/schema';
import { ValidationFallbackType, ValidationHighPriorityFallbackType } from '../schema/types';

export function optional(args: Schema['__optional']) {
  return async (value: any, path: (string | number)[]): Promise<ValidationHighPriorityFallbackType> => {
    if (value === undefined) {
      if (args?.allow === true)
        return {
          parsed: value,
          errors: [],
          shouldPreventLowPriorityFallbacks: true,
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
        shouldPreventLowPriorityFallbacks: true,
      };
    }

    return {
      parsed: value,
      errors: [],
      shouldPreventLowPriorityFallbacks: false,
    };
  };
}

export function nullable(args: Schema['__nullable']) {
  return async (value: any, path: (string | number)[]): Promise<ValidationHighPriorityFallbackType> => {
    if (value === undefined) {
      if (args?.allow === true)
        return {
          parsed: value,
          errors: [],
          shouldPreventLowPriorityFallbacks: true,
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
        shouldPreventLowPriorityFallbacks: true,
      };
    }

    return {
      parsed: value,
      errors: [],
      shouldPreventLowPriorityFallbacks: false,
    };
  };
}
