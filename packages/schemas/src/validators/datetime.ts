import DatetimeSchema from '../schema/datetime';
import Schema from '../schema/schema';
import { ValidationFallbackReturnType } from '../schema/types';

export function datetimeValidation(): ValidationFallbackReturnType {
  return {
    type: 'medium',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['_transformToAdapter']>[0]) => {
      const isValid = value instanceof Date && !isNaN(value.getTime());

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'datetime',
                path: path || [],
                message: 'Value is not a date',
              },
            ],
        preventChildValidation: true,
      };
    },
  };
}

export function allowStringParser(): ValidationFallbackReturnType {
  return {
    type: 'high',
    callback: async (
      value: any,
      _path: (string | number)[],
      _options: Parameters<Schema['_transformToAdapter']>[0]
    ) => {
      if (typeof value === 'string') {
        const parsed = new Date(value);
        if (parsed instanceof Date && !isNaN(parsed.getTime())) {
          return {
            parsed: parsed,
            errors: [],
          };
        }
      }
      return {
        parsed: value,
        errors: [],
      };
    },
  };
}

export function below(args: DatetimeSchema['__below']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (
      value: any,
      _path: (string | number)[],
      _options: Parameters<Schema['_transformToAdapter']>[0]
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
                path: _path || [],
                message: args.message,
              },
            ],
      };
    },
  };
}

export function above(args: DatetimeSchema['__above']): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (
      value: any,
      _path: (string | number)[],
      _options: Parameters<Schema['_transformToAdapter']>[0]
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
                path: _path || [],
                message: args.message,
              },
            ],
      };
    },
  };
}
