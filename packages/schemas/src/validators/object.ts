import Schema from '../schema/schema';

export function objectValidation(args: { [key: string]: Schema }) {
  return async (value: any, path: string[]): Promise<Awaited<ReturnType<Schema['__fallback'][number]>>> => {
    if (typeof value !== 'object')
      return [
        {
          code: 'object',
          isValid: false,
          message: 'Not an object',
          path: path || [],
        },
      ];
    const errors: { [key: string]: Awaited<ReturnType<Schema['__fallback'][number]>> } = {};
    const toValidateEntries = Object.entries(args);
    await Promise.all(
      toValidateEntries.map(async ([key, schema]) => {
        const { errors: parseErrors } = await schema._parse(value[key], [...path, key]);
        if (Array.isArray(parseErrors) && parseErrors.length > 0) errors[key] = parseErrors;
      })
    );

    return Object.values(errors).flat();
  };
}
