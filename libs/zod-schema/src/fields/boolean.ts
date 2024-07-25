import { BooleanFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

import type { BooleanAdapterTranslateArgs, FieldAdapter } from '@palmares/schemas';

export default class ZodBooleanFieldSchemaAdapter extends BooleanFieldAdapter {
  translate(fieldAdapter: FieldAdapter, args: BooleanAdapterTranslateArgs) {
    let result = z.boolean();

    result = fieldAdapter.translate(fieldAdapter, args, result);

    return args.withFallback(['falseValues', 'trueValues'], result);
  }

  async parse(
    _adapter: any,
    _fieldAdapter: FieldAdapter,
    result: z.ZodObject<any>,
    value: any,
    _args: BooleanAdapterTranslateArgs
  ) {
    try {
      const parsed = result.safeParse(value);
      return { errors: undefined, parsed: parsed.success ? parsed.data : undefined };
    } catch (error) {
      if (error instanceof z.ZodError) return { errors: error.errors, parsed: undefined };
      else throw error;
    }
  }
}
