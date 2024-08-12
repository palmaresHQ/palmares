import { fieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

export default fieldAdapter({
  translate: (_, args, baseResult) => {
    if (args.optional.allow) baseResult = baseResult.optional();
    if (args.nullable.allow) baseResult = baseResult.nullable();
    return baseResult;
  },
  // eslint-disable-next-line ts/require-await
  parse: async (_adapter, _fieldAdapter, result: z.ZodObject<any>, value, _args) => {
    try {
      const parsed = result.safeParse(value);
      return {
        errors: parsed.success ? undefined : parsed.error.issues,
        parsed: parsed.success ? parsed.data : undefined
      };
    } catch (error) {
      if (error instanceof z.ZodError) return { errors: error.errors, parsed: undefined };
      else throw error;
    }
  },
  // eslint-disable-next-line ts/require-await
  formatError: async (_adapter, _fieldAdapter, _schema, error: z.ZodIssue, _metadata?: any) => {
    switch (error.code) {
      case 'invalid_type':
        if (error.received === 'null') {
          return {
            code: 'null',
            path: error.path,
            message: error.message
          };
        }
        return {
          code: 'required',
          path: error.path,
          message: error.message
        };
    }
    return error as any;
  },
  // eslint-disable-next-line ts/require-await
  toString: async (_adapter, _fieldAdapter, args, baseResult) => {
    if (args.optional.allow) baseResult += `.optional()`;
    if (args.nullable.allow) baseResult += `.nullable()`;
    return baseResult;
  }
});
