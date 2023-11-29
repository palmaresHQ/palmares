import { FieldAdapter, ObjectAdapterTranslateArgs, ObjectFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

export default class ZodObjectFieldSchemaAdapter extends ObjectFieldAdapter<z.ZodNumber> {
  translate(fieldAdapter: FieldAdapter<any>, args: ObjectAdapterTranslateArgs) {
    let result = fieldAdapter.translate(fieldAdapter, args, z.object(args.data));
    return result;
  }

  async parse(_adapter: any, result: z.ZodNumber, value: any) {
    try {
      const parsed = await result.parseAsync(value);
      return { errors: null, parsed };
    } catch (error) {
      if (error instanceof z.ZodError) return { errors: error.errors, parsed: value };
      else throw error;
    }
  }
}
