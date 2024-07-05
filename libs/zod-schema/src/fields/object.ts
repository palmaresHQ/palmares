import {
  ErrorCodes,
  FieldAdapter,
  ObjectAdapterToStringArgs,
  ObjectAdapterTranslateArgs,
  ObjectFieldAdapter,
  SchemaAdapter,
} from '@palmares/schemas';
import * as z from 'zod';

export default class ZodObjectFieldSchemaAdapter extends ObjectFieldAdapter {
  translate(fieldAdapter: FieldAdapter, args: ObjectAdapterTranslateArgs) {
    let result = z.object(args.data);
    result = fieldAdapter.translate(fieldAdapter, args, result);
    return result;
  }

  async parse(_adapter: any,_fieldAdapter: FieldAdapter, result: z.ZodObject<any>, value: any, _args: ObjectAdapterTranslateArgs) {
    try {
      const parsed = await result.parseAsync(value, { });
      return { errors: null, parsed };
    } catch (error) {
      if (error instanceof z.ZodError) return { errors: error.errors, parsed: value };
      else throw error;
    }
  }

  formatError(_adapter:SchemaAdapter, _fieldAdapter: FieldAdapter, error: any, _metadata?: any): Promise<{ message: string; path: (string | number)[]; code: ErrorCodes; }> {
    return error
  }

  async toString(
    _adapter: SchemaAdapter,
    _fieldAdapter: FieldAdapter,
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
