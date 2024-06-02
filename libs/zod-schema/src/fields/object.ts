import {
  FieldAdapter,
  ObjectAdapterToStringArgs,
  ObjectAdapterTranslateArgs,
  ObjectFieldAdapter,
  SchemaAdapter,
} from '@palmares/schemas';
import * as z from 'zod';

export default class ZodObjectFieldSchemaAdapter extends ObjectFieldAdapter<z.ZodObject<any>> {
  translate(fieldAdapter: FieldAdapter<any>, args: ObjectAdapterTranslateArgs) {
    let result = fieldAdapter.translate(fieldAdapter, args, z.object(args.data));
    return result;
  }

  async parse(_adapter: any, result: z.ZodObject<any>, value: any) {
    try {
      const parsed = await result.parseAsync(value);
      return { errors: null, parsed };
    } catch (error) {
      if (error instanceof z.ZodError) return { errors: error.errors, parsed: value };
      else throw error;
    }
  }

  async toString(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter<any>,
    args: ObjectAdapterToStringArgs,
    _base?: any
  ): Promise<string> {
    let objectData = `{\n`;
    for (const [key, value] of Object.entries(args.data)) {
      objectData = objectData + `  ${key}: ${value},\n`;
    }
    return `z.object(${objectData.slice(0, -2)}\n)`;
  }
}