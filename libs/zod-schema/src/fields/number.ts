import {
  FieldAdapter,
  NumberAdapter,
  NumberAdapterTranslateArgs,
  NumberAdapterToStringArgs,
  SchemaAdapter,
} from '@palmares/schemas';
import * as z from 'zod';

export default class ZodNumberFieldSchemaAdapter extends NumberAdapter {
  translate(fieldAdapter: FieldAdapter, args: NumberAdapterTranslateArgs) {
    let result = z.number();
    /**if (args.max) {
      if (args.max.inclusive) result = result.lte(args.max.value, args.max.message);
      else result = result.lt(args.max.value, args.max.message);
    }*/
    if (args.min) {
      if (args.min.inclusive) result = result.gte(args.min.value, args.min.message);
      else result = result.gt(args.min.value, args.min.message);
    }
    if (args.allowNegative) result = result.negative(args.allowNegative.message);
    if (args.allowPositive) result = result.positive(args.allowPositive.message);
    result = fieldAdapter.translate(fieldAdapter, args, result);

    return args.withFallback(['max'], result);
  }

  async parse(_adapter: SchemaAdapter, _fieldAdapter: FieldAdapter, result: z.ZodNumber, value: any) {
    try {
      const parsed = result.safeParse(value);
      return { errors: undefined, parsed };
    } catch (error) {
      if (error instanceof z.ZodError) return { errors: error.errors, parsed: undefined };
      else throw error;
    }
  }

  async toString(adapter: SchemaAdapter, fieldAdapter: FieldAdapter, args: NumberAdapterToStringArgs) {
    let result = `z.number()`;
    if (args.max) {
      if (args.max.inclusive) result += `.lte(${args.max.value}, ${args.max.message})`;
      else result += `.lt(${args.max.value}, ${args.max.message})`;
    }
    if (args.min) {
      if (args.min.inclusive) result += `.gte(${args.min.value}, ${args.min.message})`;
      else result += `.gt(${(args.min.value, args.min.message)})`;
    }
    if (args.allowNegative) result += `.negative(${args.allowNegative.message})`;
    if (args.allowPositive) result += `.positive(${args.allowPositive.message})`;
    result = await fieldAdapter.toString(adapter, fieldAdapter, args, result);
    return result;
  }
}
