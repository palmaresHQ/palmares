import Schema from '../schema/schema';
import { ValidationFallbackType } from '../schema/types';

export function objectValidation(keysToFallback: { [key: string]: Schema }) {
  return async (
    value: any,
    path: (string | number)[],
    options: Parameters<Schema['_transformToAdapter']>[0]
  ): Promise<ValidationFallbackType> => {
    if (typeof value !== 'object')
      return {
        parsed: value,
        errors: [
          {
            code: 'object',
            isValid: false,
            message: 'Not an object',
            path: path || [],
          },
        ],
      };
    const errors: { [key: string]: ValidationFallbackType['errors'] } = {};
    const toValidateEntries = Object.entries(keysToFallback);

    await Promise.all(
      toValidateEntries.map(async ([key, schema]) => {
        const { parsed, errors: parseErrors } = await schema._parse(value[key], [...path, key], options);
        if (Array.isArray(parseErrors) && parseErrors.length > 0) errors[key] = parseErrors;
        else value[key] = parsed;

        // We append the toInternalToBubbleUp to the parent toInternalToBubbleUp
        if (schema.__toInternal && options.toInternalToBubbleUp)
          options.toInternalToBubbleUp.push(async () => (value[key] = await (schema as any).__toInternal(parsed)));
      })
    );

    return {
      parsed: value,
      errors: Object.values(errors).flat(),
    };
  };
}
