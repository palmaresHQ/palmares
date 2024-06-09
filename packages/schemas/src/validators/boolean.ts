import BooleanSchema from '../schema/boolean';
import Schema from '../schema/schema';
import { ValidationFallbackReturnType } from '../schema/types';

export function booleanValidation(): ValidationFallbackReturnType {
  return {
    type: 'medium',
    callback: async (value: any, path: (string | number)[], _options: Parameters<Schema['_transformToAdapter']>[0]) => {
      const isValid = typeof value === 'boolean';

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'boolean',
                path: path || [],
                message: 'Value is not a boolean',
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
      const parsed = Boolean(value);
      return {
        parsed: parsed,
        errors: [],
      };
    },
  };
}
