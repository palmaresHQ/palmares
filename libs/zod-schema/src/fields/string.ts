import { StringFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

import type { ErrorCodes, FieldAdapter, SchemaAdapter, StringAdapterTranslateArgs } from '@palmares/schemas';

export default class ZodStringFieldSchemaAdapter extends StringFieldAdapter {
  async translate(fieldAdapter: FieldAdapter, args: StringAdapterTranslateArgs) {
    const result = z.string();
    return result;
  }

  async parse(
    _adapter: any,
    _fieldAdapter: FieldAdapter,
    result: z.ZodObject<any>,
    value: any,
    _args: StringAdapterTranslateArgs
  ) {
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
  }

  async formatError(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter,
    _error: any,
    _metadata?: any
  ): Promise<{ message: string; path: (string | number)[]; code: ErrorCodes }> {
    return _error;
  }
}
