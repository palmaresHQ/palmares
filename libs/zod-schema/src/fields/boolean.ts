import { FieldAdapter, BooleanFieldAdapter, BooleanAdapterTranslateArgs, SchemaAdapter } from '@palmares/schemas';
import * as z from 'zod';

export default class ZodBooleanFieldSchemaAdapter extends BooleanFieldAdapter<z.ZodBoolean> {
  translate(fieldAdapter: FieldAdapter<any>, args: BooleanAdapterTranslateArgs) {
    let result = z.boolean();

    result = fieldAdapter.translate(fieldAdapter, args, result);

    return args.withFallback(['falseValues', 'trueValues'], result);
  }

  async parse(_adapter: any,_fieldAdapter: FieldAdapter<any>, result: z.ZodObject<any>, value: any, _args: BooleanAdapterTranslateArgs) {
    try {
      const parsed = result.safeParse(value);
      return { errors: undefined, parsed: parsed.success ? parsed.data : undefined };
    } catch (error) {
      if (error instanceof z.ZodError) return { errors: error.errors, parsed: undefined };
      else throw error;
    }
  }
}