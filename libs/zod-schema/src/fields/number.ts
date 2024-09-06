import { numberFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

import type { FieldAdapter, NumberAdapterToStringArgs, SchemaAdapter } from '@palmares/schemas';

export const numberAdapter = numberFieldAdapter({
  translate: (fieldAdapter, args) => {
    let result: z.ZodNumber | z.ZodEffects<z.ZodNumber, number, number> = z.number({
      errorMap: (issue) => {
        const isOptional =
          issue.code === 'invalid_type' && issue.expected === 'number' && issue.received === 'undefined';
        const isNullable = issue.code === 'invalid_type' && issue.received === 'null';
        if (isOptional) return { message: args.optional.message };
        else if (isNullable) return { message: args.nullable.message };
        else if (issue.code === 'invalid_type') return { message: args.type.message };
        return { message: issue.message || '' };
      }
    });
    if (args.integer) result = result.int(args.integer.message);
    if (args.max) {
      if (args.max.inclusive) result = result.lte(args.max.value, args.max.message);
      else result = result.lt(args.max.value, args.max.message);
    }
    if (args.min) {
      if (args.min.inclusive) result = result.gte(args.min.value, args.min.message);
      else result = result.gt(args.min.value, args.min.message);
    }
    if (args.maxDigits)
      result = result.superRefine((value, ctx) => {
        const isValid = value.toString().replaceAll('.', '').length <= (args.maxDigits?.value as number);
        if (!isValid)
          ctx.addIssue({
            code: 'max_digits' as any,
            expected: args.maxDigits?.value,
            message: args.maxDigits?.message
          });
      });
    if (args.decimalPlaces)
      result = result.superRefine((value, ctx) => {
        const isValid = (value.toString().split('.')[1] || '').length <= (args.decimalPlaces?.value as number);
        if (!isValid)
          ctx.addIssue({
            code: 'decimal_places' as any,
            expected: args.decimalPlaces?.value,
            message: args.decimalPlaces?.message
          });
      }) as z.ZodEffects<z.ZodNumber, number, number>;
    if (args.is) {
      const isAsSet = new Set<number>(args.is.value);
      result = result.superRefine((value, ctx) => {
        const isValid = isAsSet.has(value);
        if (!isValid)
          ctx.addIssue({
            code: 'is' as any,
            expected: args.is?.value,
            message: args.is?.message
          });
      }) as z.ZodEffects<z.ZodNumber, number, number>;
    }

    if (args.parsers.allowString) {
      result = z.preprocess((value) => {
        if (typeof value === 'string') return Number(value);
        return value;
      }, result) as z.ZodEffects<z.ZodNumber, number, number>;
    }

    result = fieldAdapter.translate(fieldAdapter, args, result);
    return result;
  },
  // eslint-disable-next-line ts/require-await
  parse: async (_adapter, fieldAdapter, result: z.ZodNumber, value, _args) => {
    return fieldAdapter.parse(_adapter, fieldAdapter, result, value, _args);
  },
  toString: async (adapter: SchemaAdapter, fieldAdapter: FieldAdapter, args: NumberAdapterToStringArgs) => {
    let result = `z.number()`;
    if (args.max) {
      if (args.max.inclusive) result += `.lte(${args.max.value}, ${args.max.message})`;
      else result += `.lt(${args.max.value}, ${args.max.message})`;
    }
    if (args.min) {
      if (args.min.inclusive) result += `.gte(${args.min.value}, ${args.min.message})`;
      else result += `.gt(${(args.min.value, args.min.message)})`;
    }
    result = await fieldAdapter.toString(adapter, fieldAdapter, args, result);
    return result;
  },
  // eslint-disable-next-line ts/require-await
  formatError: async (_adapter, fieldAdapter, _schema, error: z.ZodIssue, _metadata?: any) => {
    switch (error.code as typeof error.code | 'max_digits' | 'decimal_places' | 'is') {
      case 'invalid_type': {
        if ((error as any)?.expected === 'integer')
          return {
            code: 'integer',
            path: error.path,
            message: error.message
          };
        return fieldAdapter.formatError(_adapter, fieldAdapter, _schema, error, _metadata) as Promise<any>;
      }
      case 'max_digits':
        return {
          code: 'maxDigits',
          path: error.path,
          message: error.message
        };

      case 'decimal_places':
        return {
          code: 'decimalPlaces',
          path: error.path,
          message: error.message
        };

      case 'is':
        return {
          code: 'is',
          path: error.path,
          message: error.message
        };

      case 'too_big':
        if ((error as any).type === 'number')
          return {
            code: 'max',
            path: error.path,
            message: error.message
          };
        break;
      case 'too_small':
        if ((error as any).type === 'number')
          return {
            code: 'min',
            path: error.path,
            message: error.message
          };
        break;
    }

    return fieldAdapter.formatError(_adapter, fieldAdapter, _schema, error, _metadata) as Promise<any>;
  }
});
