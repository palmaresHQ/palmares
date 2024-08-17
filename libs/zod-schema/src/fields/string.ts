import { stringFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

export default stringFieldAdapter({
  translate: (fieldAdapter, args) => {
    let result: z.ZodString | z.ZodEnum<[string, ...string[]]> | z.ZodLiteral<string> = z.string({
      errorMap: (issue) => {
        const isOptional =
          issue.code === 'invalid_type' && issue.expected === 'string' && issue.received === 'undefined';
        const isNullable = issue.code === 'invalid_type' && issue.received === 'null';
        if (isOptional) return { message: args.optional.message };
        else if (isNullable) return { message: args.nullable.message };
        else if (issue.code === 'invalid_type') return { message: args.type.message };
        return { message: issue.message || '' };
      }
    });
    if (args.endsWith) result = result.endsWith(args.endsWith.value, args.endsWith.message);
    if (args.startsWith) result = result.startsWith(args.startsWith.value, args.startsWith.message);
    if (args.includes) result = result.includes(args.includes.value, { message: args.includes.message });
    if (args.maxLength)
      result = result.max(args.maxLength.value > 0 ? args.maxLength.value : 0, args.maxLength.message);
    if (args.minLength)
      result = result.min(args.minLength.value > 0 ? args.minLength.value : 0, args.minLength.message);
    if (args.regex) result = result.regex(args.regex.value, args.regex.message);
    if (args.uuid) result = result.uuid(args.uuid.message);
    if (args.email) result = result.email(args.email.message);
    if (args.is) {
      if (Array.isArray(args.is.value))
        result = z.enum(args.is.value as [string, ...string[]], {
          errorMap: (issue) => {
            if (issue.code === 'invalid_enum_value')
              return {
                message: args.is?.message || ''
              };
            return { message: issue.message || '' };
          }
        });
      else
        result = z.literal(args.is.value, {
          errorMap: (issue) => {
            if (issue.code === 'invalid_literal') return { message: args.is?.message || '' };
            return { message: issue.message || '' };
          }
        });
    }
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
  // eslint-disable-next-line ts/require-await
  formatError: async (_adapter, fieldAdapter, _schema, error: z.ZodIssue, _metadata?: any) => {
    switch (error.code) {
      case 'invalid_enum_value':
        return {
          code: 'is',
          path: error.path,
          message: error.message
        };
      case 'invalid_string': {
        const validationAsObject =
          // eslint-disable-next-line ts/no-unnecessary-condition
          typeof error.validation === 'object' && error.validation !== null ? error.validation : {};
        const validationAsString = typeof error.validation === 'string' ? error.validation : '';
        if ('includes' in validationAsObject && 'position' in validationAsObject) {
          return {
            code: 'includes',
            path: error.path,
            message: error.message
          };
        } else if ('startsWith' in validationAsObject) {
          return {
            code: 'startsWith',
            path: error.path,
            message: error.message
          };
        } else if ('endsWith' in validationAsObject) {
          return {
            code: 'endsWith',
            path: error.path,
            message: error.message
          };
        } else if (validationAsString === 'regex') {
          return {
            code: 'regex',
            message: error.message,
            path: error.path
          };
        } else if (validationAsString === 'uuid') {
          return {
            code: 'uuid',
            message: error.message,
            path: error.path
          };
        } else if (validationAsString === 'email') {
          return {
            code: 'email',
            message: error.message,
            path: error.path
          };
        }
        return error;
      }
      case 'too_big':
        if ((error as any).type === 'string')
          return {
            code: 'maxLength',
            path: error.path,
            message: error.message
          };
        break;
      case 'too_small':
        if ((error as any).type === 'string')
          return {
            code: 'minLength',
            path: error.path,
            message: error.message
          };
        break;
    }

    return fieldAdapter.formatError(_adapter, fieldAdapter, _schema, error, _metadata) as Promise<any>;
  },
  // eslint-disable-next-line ts/require-await
  toString: async () => {
    return '';
  }
});
