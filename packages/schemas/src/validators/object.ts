import Schema from '../schema/schema';

export function objectValidation(keysToFallback: { [key: string]: Schema }) {
  return async (value: any, path: (string | number)[]): Promise<Awaited<ReturnType<Schema['__fallback'][number]>>> => {
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
    const errors: { [key: string]: Awaited<ReturnType<Schema['__fallback'][number]>>['errors'] } = {};
    const toValidateEntries = Object.entries(keysToFallback);
    await Promise.all(
      toValidateEntries.map(async ([key, schema]) => {
        const { parsed, errors: parseErrors } = await schema._parse(value[key], [...path, key]);
        if (Array.isArray(parseErrors) && parseErrors.length > 0) errors[key] = parseErrors;
        else value[key] = parsed;
      })
    );

    return {
      parsed: value,
      errors: Object.values(errors).flat(),
    };
  };
}
