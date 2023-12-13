import Schema from '../schema/schema';

import type { ValidationFallbackCallbackReturnType, ValidationFallbackReturnType } from '../schema/types';

export function objectValidation(keysToFallback: { [key: string]: Schema }): ValidationFallbackReturnType {
  return {
    type: 'low',
    callback: async (value: any, path: (string | number)[], options: Parameters<Schema['_transformToAdapter']>[0]) => {
      const errors: { [key: string]: ValidationFallbackCallbackReturnType['errors'] } = {};
      const toValidateEntries = Object.entries(keysToFallback);

      await Promise.all(
        toValidateEntries.map(async ([key, schema]) => {
          const schemaWithProtected = schema as Schema & {
            __parse: Schema['__parse'];
            __toInternal: Schema['__toInternal'];
          };
          const { parsed, errors: parseErrors } = await schemaWithProtected.__parse(
            value[key],
            [...path, key],
            options
          );
          if (Array.isArray(parseErrors) && parseErrors.length > 0) errors[key] = parseErrors;
          else value[key] = parsed;

          // We append the toInternalToBubbleUp to the parent toInternalToBubbleUp
          if (schemaWithProtected.__toInternal && options.toInternalToBubbleUp)
            options.toInternalToBubbleUp.push(async () => (value[key] = await (schema as any).__toInternal(parsed)));
        })
      );

      return {
        parsed: value,
        errors: Object.values(errors).flat(),
      };
    },
  };
}
