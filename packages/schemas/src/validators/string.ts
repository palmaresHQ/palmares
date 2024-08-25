import { type ValidationFallbackReturnType } from '../schema/types';

import type Schema from '../schema/schema';
import type StringSchema from '../schema/string';

export function stringValidation(): ValidationFallbackReturnType {
  return {
    name: 'string',
    type: 'medium',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      return {
        parsed: value,
        errors:
          typeof value === 'string'
            ? []
            : [
                {
                  isValid: typeof value === 'string',
                  code: 'string',
                  // eslint-disable-next-line ts/no-unnecessary-condition
                  path: path || [],
                  message: 'The value must be a string. Received: ' + typeof value
                }
              ]
      };
    }
  };
}

export function maxLength(args: NonNullable<StringSchema['__maxLength']>): ValidationFallbackReturnType {
  return {
    name: 'maxLength',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = value.length <= args.value;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'maxLength',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}

export function minLength(args: NonNullable<StringSchema['__maxLength']>): ValidationFallbackReturnType {
  return {
    name: 'minLength',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = value.length >= args.value;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'minLength',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}

export function endsWith(args: NonNullable<StringSchema['__endsWith']>): ValidationFallbackReturnType {
  return {
    name: 'endsWith',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = value.endsWith(args.value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'endsWith',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}

export function startsWith(args: NonNullable<StringSchema['__startsWith']>): ValidationFallbackReturnType {
  return {
    name: 'startsWith',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = value.startsWith(args.value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'startsWith',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}

export function includes(args: NonNullable<StringSchema['__includes']>): ValidationFallbackReturnType {
  return {
    name: 'includes',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = value.includes(args.value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'includes',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}

export function regex(args: NonNullable<StringSchema['__regex']>): ValidationFallbackReturnType {
  return {
    name: 'regex',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = args.value.test(value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'regex',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}

export function uuid(args: NonNullable<StringSchema['__uuid']>): ValidationFallbackReturnType {
  // const uuidRegex =
  //   /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
  const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
  return {
    name: 'uuid',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = uuidRegex.test(value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'uuid',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}

export function email(args: NonNullable<StringSchema['__email']>): ValidationFallbackReturnType {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  console.log('aquiiiiii');
  return {
    name: 'email',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = emailRegex.test(value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'email',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}
