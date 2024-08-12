import type Schema from '../schema/schema';
import type { ValidationFallbackReturnType } from '../schema/types';

export function booleanValidation(): ValidationFallbackReturnType {
  return {
    name: 'boolean',
    type: 'medium',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const isValid = typeof value === 'boolean';

      return {
        parsed: value,
        errors: isValid
          ? []
          : [
              {
                isValid: false,
                code: 'boolean',
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

export function allowStringParser(): ValidationFallbackReturnType {
  return {
    name: 'allowString',
    type: 'high',
    // eslint-disable-next-line ts/require-await
    callback: async (
      value: any,
      _path: (string | number)[],
      _options: Parameters<Schema['__transformToAdapter']>[0]
    ) => {
      const parsed = Boolean(value);
      return {
        parsed: parsed,
        errors: []
      };
    }
  };
}
