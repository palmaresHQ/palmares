import { unionFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

import { transformErrorsOnComplexTypes } from '../utils';

export const unionAdapter = unionFieldAdapter({
  translate: (fieldAdapter, args) => {
    let result = z.union(args.schemas, {
      errorMap: (issue) => {
        if (issue.code === 'invalid_union') {
          for (const unionError of issue.unionErrors) {
            for (const issue of unionError.issues) {
              if (issue.code === 'invalid_type' && issue.received === 'undefined')
                issue.message = args.optional.message;
              if (issue.code === 'invalid_type' && issue.received === 'null') issue.message = args.nullable.message;
              else if (issue.code === 'invalid_type') return { message: args.type.message };
            }
          }
        }
        return { message: issue.message || '' };
      }
    });
    result = fieldAdapter.translate(fieldAdapter, args, result);
    return result;
  },
  // eslint-disable-next-line ts/require-await
  toString: async (_adapter, _fieldAdapter, _args) => {
    return '';
  },
  formatError: (adapter, fieldAdapter, schema: z.ZodUnion<any>, error: z.ZodIssue, metadata) => {
    if (metadata === undefined) metadata = {};
    if (metadata.$type instanceof Set === false) metadata.$type = new Set();
    if (metadata.$type instanceof Set) metadata.$type.add('union');
    return transformErrorsOnComplexTypes(adapter, fieldAdapter, schema, error, metadata);
  },
  // eslint-disable-next-line ts/require-await
  parse: async (_adapter, fieldAdapter, result: z.ZodObject<any>, value, _args) => {
    return fieldAdapter.parse(_adapter, fieldAdapter, result, value, _args);
  }
});
