import { datetimeFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

import type { ErrorCodes } from '@palmares/schemas';

export default datetimeFieldAdapter({
  translate: (fieldAdapter, args) => {
    let result: z.ZodDate | z.ZodEffects<z.ZodDate, Date, Date> = z.date({
      errorMap: (issue) => {
        const isOptional = issue.code === 'invalid_type' && issue.expected === 'date' && issue.received === 'undefined';
        const isNullable = issue.code === 'invalid_type' && issue.received === 'null';
        if (isOptional) return { message: args.optional.message };
        else if (isNullable) return { message: args.nullable.message };
        return { message: issue.message || '' };
      }
    });

    if (args.below) {
      result = result.superRefine((value, ctx) => {
        const isValid = args.below
          ? args.below.inclusive
            ? value <= args.below.value
            : value < args.below.value
          : true;
        if (!isValid)
          ctx.addIssue({
            code: 'below' as any,
            expected: args.below?.value,
            message: args.below?.message
          });
      });
    }

    if (args.above) {
      result = result.superRefine((value, ctx) => {
        const isValid = args.above
          ? args.above.inclusive
            ? value >= args.above.value
            : value > args.above.value
          : true;
        if (!isValid)
          ctx.addIssue({
            code: 'above' as any,
            expected: args.above?.value,
            message: args.above?.message
          });
      }) as z.ZodEffects<z.ZodDate, Date, Date>;
    }

    if (args.allowString) {
      result = z.preprocess((value) => {
        if (typeof value === 'string') {
          return new Date(value);
        }
        return value;
      }, result) as z.ZodEffects<z.ZodDate, Date, Date>;
    }

    result = fieldAdapter.translate(fieldAdapter, args, result);

    return result;
  },
  // eslint-disable-next-line ts/require-await
  toString: async (_adapter) => {
    return '';
  },
  // eslint-disable-next-line ts/require-await
  formatError: async (_adapter, fieldAdapter, _schema, error: z.ZodIssue, _metadata) => {
    switch (error.code as typeof error.code | 'below' | 'above') {
      case 'below':
        return {
          code: 'below',
          path: error.path,
          message: error.message
        };
      case 'above':
        return {
          code: 'above',
          path: error.path,
          message: error.message
        };
    }
    return fieldAdapter.formatError(_adapter, fieldAdapter, _schema, error, _metadata) as Promise<{
      message: string;
      path: (string | number)[];
      code: ErrorCodes;
    }>;
  },
  // eslint-disable-next-line ts/require-await
  parse: async (_adapter, fieldAdapter, result, value, _args) => {
    return fieldAdapter.parse(_adapter, fieldAdapter, result, value, _args);
  }
});
