import { FieldAdapter, ObjectAdapterTranslateArgs, ObjectFieldAdapter } from '@palmares/schemas';
import * as z from 'zod';

export default class ZodObjectFieldSchemaAdapter extends ObjectFieldAdapter<z.ZodNumber> {
  translate(_fieldAdapter: FieldAdapter<any>, args: ObjectAdapterTranslateArgs) {
    let result = z.object(args.data);
    return result;
  }

  async parse(_adapter: any, result: z.ZodNumber, _value: any) {
    try {
      const parsed = await result.parseAsync(_value);
      return { errors: null, parsed };
    } catch (error) {
      if (error instanceof z.ZodError) return { errors: error.errors, parsed: null };
      else throw error;
    }
  }
}
