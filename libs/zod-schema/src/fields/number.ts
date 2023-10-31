import { FieldAdapter, NumberAdapter, NumberAdapterTranslateArgs } from '@palmares/schemas';
import * as z from 'zod';

export default class ZodNumberFieldSchemaAdapter extends NumberAdapter<z.ZodNumber> {
  translate(_fieldAdapter: FieldAdapter<any>, args: NumberAdapterTranslateArgs) {
    const result = z.number();
    if (args.max) {
      if (args.max.inclusive) result.lte(args.max.value, args.max.message);
      else result.lt(args.max.value, args.max.message);
    }
    if (args.min) {
      if (args.min.inclusive) result.gte(args.min.value, args.min.message);
      else result.gt(args.min.value, args.min.message);
    }
    if (args.allowNegative) result.negative(args.allowNegative.message);
    if (args.allowPositive) result.positive(args.allowPositive.message);
    return result;
  }

  async parse(_adapter: any, result: z.ZodNumber, _value: any) {
    try {
      const parsed = await result.parseAsync(_value);
      return { errors: null, parsed };
    } catch (e) {
      return { errors: 'hey', parsed: null };
    }
  }
}
