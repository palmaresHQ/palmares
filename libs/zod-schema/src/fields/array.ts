import { arrayFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

import { transformErrorsOnComplexTypes } from '../utils';

import type { ErrorCodes } from '@palmares/schemas';

export const arrayAdapter = arrayFieldAdapter({
  translate: (fieldAdapter, args) => {
    let result = (z[args.isTuple ? 'tuple' : 'array'] as any)(
      // eslint-disable-next-line ts/no-unnecessary-type-assertion
      args.isTuple ? args.schemas : args.schemas[0],
      {
        errorMap: (issue: z.ZodIssue) => {
          const isOptional =
            issue.code === 'invalid_type' && issue.expected === 'array' && issue.received === 'undefined';
          const isNullable = issue.code === 'invalid_type' && issue.received === 'null';
          if (isOptional) return { message: args.optional.message };
          else if (isNullable) return { message: args.nullable.message };
          else if (issue.code === 'invalid_type') return { message: args.type.message };
          return { message: issue.message || '' };
        }
      }
    ) as z.ZodTuple | z.ZodArray<any, 'atleastone' | 'many'>;
    if (args.maxLength && args.maxLength.inclusive)
      result = (result as z.ZodArray<any>).max(args.maxLength.value, args.maxLength.message);
    if (args.maxLength && args.maxLength.inclusive === false)
      result = (result as z.ZodArray<any>).max(args.maxLength.value - 1, args.maxLength.message);
    if (args.minLength && args.minLength.inclusive)
      result = (result as z.ZodArray<any>).min(args.minLength.value, args.minLength.message);
    if (args.minLength && args.minLength.inclusive === false)
      result = (result as z.ZodArray<any>).min(args.minLength.value + 1, args.minLength.message);

    result = fieldAdapter.translate(fieldAdapter, args, result);
    return result;
  },
  // eslint-disable-next-line ts/require-await
  toString: async (_adapter, _fieldAdapter, _args) => {
    return '';
  },
  formatError: (adapter, fieldAdapter, schema: z.ZodArray<any> | z.ZodTuple<any>, error: z.ZodIssue, metadata) => {
    if (metadata === undefined) metadata = {};
    if (metadata.$type instanceof Set === false) metadata.$type = new Set();
    if (metadata.$type instanceof Set) metadata.$type.add('array');

    switch (error.code) {
      case 'too_big':
        if ((error as any).type === 'array')
          return {
            code: 'maxLength' as ErrorCodes,
            path: error.path,
            message: error.message
          } as any;
        break;
      case 'too_small':
        if ((error as any).type === 'array')
          return {
            code: 'minLength',
            path: error.path,
            message: error.message
          } as any;
        break;
    }
    return transformErrorsOnComplexTypes(adapter, fieldAdapter, schema, error, metadata);
  },
  // eslint-disable-next-line ts/require-await
  parse: async (_adapter, fieldAdapter, result: z.ZodArray<any> | z.ZodTuple<any>, value, _args) => {
    return fieldAdapter.parse(_adapter, fieldAdapter, result, value, _args);
  }
});
