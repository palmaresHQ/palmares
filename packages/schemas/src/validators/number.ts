import NumberSchema from '../schema/number';
import Schema from '../schema/schema';
import { ValidationFallbackReturnType } from '../schema/types';

export function numberValidation(): ValidationFallbackReturnType {
  return {
    type: 'medium',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['__transformToAdapter']>[0]) => {
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
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['__transformToAdapter']>[0]) => {
      if (args.inclusive)
        return {
          parsed: value,
          errors: [
            {
              isValid: value <= args.value,
              code: 'max',
              path: path || [],
              message: args.message,
            },
          ],
        };

      return {
        parsed: value,
        errors: [
          {
            isValid: value < args.value,
            code: 'max',
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
            isValid: value > args.value,
            message: args.message,
            code: 'min',
            path: path || [],
          },
        ],
      };
    },
  };
}

export function negative(args: NumberSchema['__allowNegative']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value: any, path?: (string | number)[]) => {
      const isValid = args.allowZero ? value < 0 : value <= 0;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: isValid,
                message: args.message,
                code: 'negative',
                path: path || [],
              },
            ],
      };
    },
  };
}

export function positive(args: NumberSchema['__allowPositive']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value: any, path?: (string | number)[]) => {
      const isValid = args.allowZero ? value > 0 : value >= 0;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: isValid,
                message: args.message,
                code: 'positive',
                path: path || [],
              },
            ],
      };
    },
  };
}

export function maxDigits(args: NumberSchema['__maxDigits']): ValidationFallbackReturnType {
  return {
    type: 'low',
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
                path: path || [],
              },
            ],
      };
    },
  };
}

export function decimalPlaces(args: NumberSchema['__decimalPlaces']): ValidationFallbackReturnType {
  return {
    type: 'low',
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
                path: path || [],
              },
            ],
      };
    },
  };
}
