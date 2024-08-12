import { UnionFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

import type {
  ErrorCodes,
  FieldAdapter,
  SchemaAdapter,
  UnionAdapterToStringArgs,
  UnionAdapterTranslateArgs
} from '@palmares/schemas';

export default class ZodUnionFieldSchemaAdapter extends UnionFieldAdapter {
  translate(
    fieldAdapter: UnionFieldAdapter,
    args: UnionAdapterTranslateArgs<readonly [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>
  ) {
    const result = z.union(args.schemas);
    return result;
  }

  async parse(_adapter: any, _fieldAdapter: FieldAdapter, result: z.ZodOptional<any>, value: any) {
    try {
      const parsed = await result.parseAsync(value);
      return { errors: null, parsed };
    } catch (error) {
      if (error instanceof z.ZodError) return { errors: error.errors, parsed: value };
      else throw error;
    }
  }

  async toString(_adapter: SchemaAdapter, _fieldAdapter: FieldAdapter, args: UnionAdapterToStringArgs) {
    const schemas = args.schemas.map((schema) => schema.toString()).join(', ');
    return `z.union([${schemas}])`;
  }

  async formatError(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter,
    error: z.ZodIssue,
    _metadata?: any
  ): Promise<{ message: string; path: (string | number)[]; code: ErrorCodes }> {
    const formattedIssues = {
      message: error.message,
      code: error.code as ErrorCodes,
      path: error.path
    };
    return formattedIssues;
  }
}
