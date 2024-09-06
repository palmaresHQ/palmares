import { booleanFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

import type { ErrorCodes } from '@palmares/schemas';

export const booleanAdapter = booleanFieldAdapter({
  translate: (fieldAdapter, args) => {
    let result: z.ZodBoolean | z.ZodEffects<z.ZodBoolean, boolean, boolean> = z.boolean({
      errorMap: (issue) => {
        const isOptional =
          issue.code === 'invalid_type' && issue.expected === 'boolean' && issue.received === 'undefined';
        const isNullable = issue.code === 'invalid_type' && issue.received === 'null';
        if (isOptional) return { message: args.optional.message };
        else if (isNullable) return { message: args.nullable.message };
        else if (issue.code === 'invalid_type') return { message: args.type.message };
        return { message: issue.message || '' };
      }
    });

    // eslint-disable-next-line ts/no-unnecessary-condition
    if (args.is)
      result = result.superRefine((value, ctx) => {
        const isValid = value === (args.is as any).value;
        if (!isValid)
          ctx.addIssue({
            code: 'is' as any,
            expected: (args.is as any).value,
            message: (args.is as any).message
          });
      });

    if (args.parsers.trueValues) {
      result = z.preprocess((value) => {
        const isValueATrueValue = args.parsers.trueValues?.includes(value);
        if (isValueATrueValue) return true;
        return value;
      }, result) as z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    }
    if (args.parsers.falseValues) {
      result = z.preprocess((value) => {
        const isValueAFalseValue = args.parsers.falseValues?.includes(value);
        if (isValueAFalseValue) return false;
        return value;
      }, result) as z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    }

    if (args.parsers.allowString) {
      result = z.preprocess((value) => {
        const isValueAString = typeof value === 'string';
        if (isValueAString) return Boolean(value);
        return value;
      }, result) as z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    }

    if (args.parsers.allowNumber) {
      result = z.preprocess((value) => {
        const isValueANumber = typeof value === 'number';
        if (isValueANumber) return Boolean(value);
        return value;
      }, result) as z.ZodEffects<z.ZodBoolean, boolean, boolean>;
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
    switch (error.code as typeof error.code | 'is') {
      case 'is':
        return {
          code: 'is',
          message: error.message,
          path: error.path
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
