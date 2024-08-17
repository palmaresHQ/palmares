import { objectFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

import { transformErrorsOnComplexTypes } from '../utils';

export default objectFieldAdapter({
  translate: (fieldAdapter, args) => {
    let result = z.object(args.data, {
      errorMap: (issue) => {
        const isOptional =
          issue.code === 'invalid_type' && issue.expected === 'object' && issue.received === 'undefined';
        const isNullable = issue.code === 'invalid_type' && issue.received === 'null';
        if (isOptional) return { message: args.optional.message };
        else if (isNullable) return { message: args.nullable.message };
        return { message: issue.message || '' };
      }
    });
    result = fieldAdapter.translate(fieldAdapter, args, result);
    return result;
  },
  // eslint-disable-next-line ts/require-await
  parse: async (_adapter, fieldAdapter, result: z.ZodObject<any>, value, _args) => {
    return fieldAdapter.parse(_adapter, fieldAdapter, result, value, _args);
  },
  formatError: async (adapter, fieldAdapter, schema: z.ZodObject<any>, error: z.ZodIssue, metadata) => {
    if (metadata === undefined) metadata = {};
    if (metadata.$type instanceof Set === false) metadata.$type = new Set();
    if (metadata.$type instanceof Set) metadata.$type.add('object');
    return transformErrorsOnComplexTypes(adapter, fieldAdapter, schema, error, metadata);
  },
  // eslint-disable-next-line ts/require-await
  toString: async (_adapter, _fieldAdapter, args) => {
    let objectData = `{\n`;
    for (const [key, value] of Object.entries(args.data)) {
      objectData = objectData + `  ${key}: ${value},\n`;
    }
    return `z.object(${objectData.slice(0, -2)}\n)`;
  }
});
