import NumberSchema from '../schema/number';
import Schema from '../schema/schema';

export function max(args: NumberSchema['__max']) {
  return async (value: any, path?: string[]): Promise<Awaited<ReturnType<Schema['__fallback'][number]>>> => {
    if (typeof value !== 'number')
      return [
        {
          isValid: false,
          code: 'number',
          path: path || [],
          message: args.message,
        },
      ];
    if (args.inclusive)
      return [
        {
          isValid: value <= args.value,
          code: 'number',
          path: path || [],
          message: args.message,
        },
      ];

    return [
      {
        isValid: value <= args.value,
        code: 'number',
        path: path || [],
        message: args.message,
      },
    ];
  };
}

export function min(args: NumberSchema['__min']) {
  return async (value: any, path?: string[]): Promise<Awaited<ReturnType<Schema['__fallback'][number]>>> => {
    if (typeof value !== 'number')
      return [
        {
          isValid: false,
          message: args.message,
          code: 'number',
          path: path || [],
        },
      ];
    if (args.inclusive)
      return [
        {
          isValid: value >= args.value,
          message: args.message,
          code: 'min',
          path: path || [],
        },
      ];

    return [
      {
        isValid: value >= args.value,
        message: args.message,
        code: 'min',
        path: path || [],
      },
    ];
  };
}
