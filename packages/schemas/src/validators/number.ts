import NumberSchema from '../schema/number';
import Schema from '../schema/schema';

export function max(args: NumberSchema['__max']) {
  return async (value: any, path?: string[]): Promise<Awaited<ReturnType<Schema['__fallback'][number]>>> => {
    if (typeof value !== 'number')
      return {
        parsed: value,
        errors: [
          {
            isValid: false,
            code: 'number',
            path: path || [],
            message: args.message,
          },
        ],
      };
    if (args.inclusive)
      return {
        parsed: value,
        errors: [
          {
            isValid: value <= args.value,
            code: 'number',
            path: path || [],
            message: args.message,
          },
        ],
      };

    return {
      parsed: value,
      errors: [
        {
          isValid: value <= args.value,
          code: 'number',
          path: path || [],
          message: args.message,
        },
      ],
    };
  };
}

export function min(args: NumberSchema['__min']) {
  return async (value: any, path?: string[]): Promise<Awaited<ReturnType<Schema['__fallback'][number]>>> => {
    if (typeof value !== 'number')
      return {
        parsed: value,
        errors: [
          {
            isValid: false,
            message: args.message,
            code: 'number',
            path: path || [],
          },
        ],
      };
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
          isValid: value >= args.value,
          message: args.message,
          code: 'min',
          path: path || [],
        },
      ],
    };
  };
}
