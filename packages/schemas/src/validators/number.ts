import type NumberSchema from '../schema/number';
import type Schema from '../schema/schema';
import type { ValidationFallbackReturnType } from '../schema/types';

export function numberValidation(): ValidationFallbackReturnType {
  return {
    name: 'number',
    type: 'medium',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      return {
        parsed: value,
        errors: [
          {
            isValid: typeof value === 'number',
            code: 'number',
            // eslint-disable-next-line ts/no-unnecessary-condition
            path: path || [],
            message: 'The value must be a number. Received: ' + typeof value
          }
        ]
      };
    }
  };
}

export function max(args: NonNullable<NumberSchema['__max']>): ValidationFallbackReturnType {
  return {
    name: 'max',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      if (args.inclusive)
        return {
          parsed: value,
          errors: [
            {
              isValid: value <= args.value,
              code: 'max',
              // eslint-disable-next-line ts/no-unnecessary-condition
              path: path || [],
              message: args.message
            }
          ]
        };

      return {
        parsed: value,
        errors: [
          {
            isValid: value < args.value,
            code: 'max',
            // eslint-disable-next-line ts/no-unnecessary-condition
            path: path || [],
            message: args.message
          }
        ]
      };
    }
  };
}

export function min(args: NonNullable<NumberSchema['__min']>): ValidationFallbackReturnType {
  return {
    name: 'min',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (value: any, path?: (string | number)[]) => {
      if (args.inclusive)
        return {
          parsed: value,
          errors: [
            {
              isValid: value >= args.value,
              message: args.message,
              code: 'min',
              path: path || []
            }
          ]
        };

      return {
        parsed: value,
        errors: [
          {
            isValid: value > args.value,
            message: args.message,
            code: 'min',
            path: path || []
          }
        ]
      };
    }
  };
}

export function integer(args: NonNullable<NumberSchema['__integer']>): ValidationFallbackReturnType {
  return {
    name: 'integer',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (value: any, path?: (string | number)[]) => {
      const isValid = Number.isInteger(value);

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: isValid,
                message: args.message,
                code: 'integer',
                path: path || []
              }
            ]
      };
    }
  };
}

export function maxDigits(args: NonNullable<NumberSchema['__maxDigits']>): ValidationFallbackReturnType {
  return {
    name: 'maxDigits',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (value: any, path?: (string | number)[]) => {
      const isValid = value.toString().replace('.', '').length <= args.value;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: isValid,
                message: args.message,
                code: 'maxDigits',
                path: path || []
              }
            ]
      };
    }
  };
}

export function decimalPlaces(args: NonNullable<NumberSchema['__decimalPlaces']>): ValidationFallbackReturnType {
  return {
    name: 'decimalPlaces',
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (value: any, path?: (string | number)[]) => {
      const isValid = value.toString().split('.')[1]?.length <= args.value;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: isValid,
                message: args.message,
                code: 'decimalPlaces',
                path: path || []
              }
            ]
      };
    }
  };
}
