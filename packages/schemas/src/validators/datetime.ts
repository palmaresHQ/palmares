import type DatetimeSchema from '../schema/datetime';
import type Schema from '../schema/schema';
import type { ValidationFallbackReturnType } from '../schema/types';

export function datetimeValidation(): ValidationFallbackReturnType {
  return {
    type: 'medium',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = value instanceof Date && !isNaN(value.getTime());

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'datetime',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: 'Value is not a date'
              }
            ],
        preventChildValidation: true
      };
    }
  };
}

export function allowStringParser(): ValidationFallbackReturnType {
  return {
    type: 'high',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      _path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      if (typeof value === 'string') {
        const parsed = new Date(value);
        if (parsed instanceof Date && !isNaN(parsed.getTime())) {
          return {
            parsed: parsed,
            errors: []
          };
        }
      }
      return {
        parsed: value,
        errors: []
      };
    }
  };
}

export function below(args: DatetimeSchema['__below']): ValidationFallbackReturnType {
  return {
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = args.inclusive ? value <= args.value : value < args.value;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'below',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}

export function above(args: DatetimeSchema['__above']): ValidationFallbackReturnType {
  return {
    type: 'low',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = args.inclusive ? value <= args.value : value < args.value;

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'above',
                // eslint-disable-next-line ts/no-unnecessary-condition
                path: path || [],
                message: args.message
              }
            ]
      };
    }
  };
}
