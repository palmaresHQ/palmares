import type Schema from '../schema/schema';
import type StringSchema from '../schema/string';
import { type ValidationFallbackReturnType } from '../schema/types';

export function stringValidation(): ValidationFallbackReturnType {
  return {
    type: 'medium',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['__transformToAdapter']>[0]) => {
      return {
        parsed: value,
        errors:
          typeof value === 'string'
            ? []
            : [
                {
                  isValid: typeof value === 'string',
                  code: 'string',
                  path: path || [],
                  message: 'The value must be a string. Received: ' + typeof value,
                },
              ],
      };
    },
  };
}

export function maxLength(args: StringSchema['__maxLength']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['__transformToAdapter']>[0]) => {
      const isValid = args.inclusive ? value.length <= args.value : value.length < args.value;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'maxLength',
                path: path || [],
                message: args.message,
              },
            ],
      };
    },
  };
}

export function minLength(args: StringSchema['__maxLength']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['__transformToAdapter']>[0]) => {
      const isValid = args.inclusive ? value.length >= args.value : value.length > args.value;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'minLength',
                path: path || [],
                message: args.message,
              },
            ],
      };
    },
  };
}

export function endsWith(args: StringSchema['__endsWith']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['__transformToAdapter']>[0]) => {
      const isValid = value.endsWith(args.value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'endsWith',
                path: path || [],
                message: args.message,
              },
            ],
      };
    },
  };
}

export function startsWith(args: StringSchema['__startsWith']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['__transformToAdapter']>[0]) => {
      const isValid = value.startsWith(args.value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'startsWith',
                path: path || [],
                message: args.message,
              },
            ],
      };
    },
  };
}

export function includes(args: StringSchema['__includes']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['__transformToAdapter']>[0]) => {
      const isValid = value.includes(args.value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'includes',
                path: path || [],
                message: args.message,
              },
            ],
      };
    },
  };
}

export function regex(args: StringSchema['__regex']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['__transformToAdapter']>[0]) => {
      const isValid = args.value.test(value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'regex',
                path: path || [],
                message: args.message,
              },
            ],
      };
    },
  };
}

export function uuid(args: StringSchema['__uuid']): ValidationFallbackReturnType {
  // const uuidRegex =
  //   /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
  const uuidRegex =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
  return {
    type: 'low',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['__transformToAdapter']>[0]) => {
      const isValid = uuidRegex.test(value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'uuid',
                path: path || [],
                message: args.message,
              },
            ],
      };
    }
  }
}

export function email(args: StringSchema['__email']): ValidationFallbackReturnType {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return {
    type: 'low',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['__transformToAdapter']>[0]) => {
      const isValid = emailRegex.test(value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'email',
                path: path || [],
                message: args.message,
              },
            ],
      };
    }
  }
}

