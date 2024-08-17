import { arrayFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

import { transformErrorsOnComplexTypes } from '../utils';

export default arrayFieldAdapter({
  translate: (fieldAdapter, args) => {
    let result = (z[args.isTuple ? 'tuple' : 'array'] as any)(
      // eslint-disable-next-line ts/no-unnecessary-type-assertion
      args.isTuple ? args.schemas : z.union(args.schemas as any),
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
    ) as z.ZodTuple | z.ZodArray<any>;
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

    return transformErrorsOnComplexTypes(adapter, fieldAdapter, schema, error, metadata);
  },
  // eslint-disable-next-line ts/require-await
  parse: async (_adapter, fieldAdapter, result: z.ZodArray<any> | z.ZodTuple<any>, value, _args) => {
    return fieldAdapter.parse(_adapter, fieldAdapter, result, value, _args);
  }
});
