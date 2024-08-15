import { objectFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

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
  formatError: async (adapter, fieldAdapter, schema: z.ZodObject<any>, error, _metadata) => {
    const stringFormattedErrors = await adapter.string?.formatError(adapter, fieldAdapter, schema, error, _metadata);
    const numberFormattedErrors = await adapter.number?.formatError(
      adapter,
      fieldAdapter,
      schema,
      stringFormattedErrors,
      _metadata
    );
    return fieldAdapter.formatError(adapter, fieldAdapter, schema, numberFormattedErrors, _metadata);
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
